import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {validateOrderStatusChange,validatePaymentChange} from '@/lib/order-state-guards';
import {z} from 'zod';
import {orderInput} from '@/lib/validation';
import {createOrder,OrderError} from '@/lib/order-service';
const ORDER_STATUSES=['RECEIVED','CONFIRMED','PREPARING','READY','DISPATCHED','DELIVERED','COMPLETED','CANCELED'] as const;
const edit=z.object({id:z.string().min(1),status:z.enum(ORDER_STATUSES).optional(),paymentStatus:z.enum(['PENDING','PAID','REFUNDED','PARTIALLY_PAID']).optional(),note:z.string().max(400).optional()}).refine(v=>v.status!==undefined||v.paymentStatus!==undefined,{message:'Nenhuma alteração informada'});
export async function GET(req:Request){
  const session=await requireRole(['ADMIN','MANAGER','CASHIER','KITCHEN']);
  if(!session)return NextResponse.json({error:'Não autorizado'},{status:401});
  const v=z.object({status:z.enum([...ORDER_STATUSES,'ALL']).optional()}).safeParse({status:new URL(req.url).searchParams.get('status')||undefined});
  if(!v.success)return NextResponse.json({error:'Filtro inválido'},{status:400});
  const status=v.data.status;
  const orders=await db.order.findMany({where:status&&status!=='ALL'?{status}:{},take:100,orderBy:{createdAt:'desc'},include:{items:true,delivery:{include:{driver:{include:{staff:{select:{name:true}}}}}}}});
  return NextResponse.json({orders:session.role==='KITCHEN'?orders.map(o=>({id:o.id,number:o.number,customerName:o.customerName,kind:o.kind,source:o.source,status:o.status,note:o.note,createdAt:o.createdAt,items:o.items.map(i=>({id:i.id,nameSnapshot:i.nameSnapshot,quantity:i.quantity,modifiers:i.modifiers}))})):orders},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
  const session=await requireRole(['ADMIN','MANAGER','CASHIER']);
  if(!session)return NextResponse.json({error:'Não autorizado'},{status:401});
  try{const input=orderInput.parse(await req.json());if(input.source!=='POS')return NextResponse.json({error:'Origem inválida para PDV'},{status:400});const data=await createOrder(input,{allowPos:true,actorId:session.id});return NextResponse.json(data,{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Erro no pedido'},{status:e instanceof OrderError?e.code:400});}
}
export async function PATCH(req:Request){
  const session=await requireRole(['ADMIN','MANAGER','CASHIER','KITCHEN']);
  if(!session)return NextResponse.json({error:'Não autorizado'},{status:401});
  try{
    const v=edit.parse(await req.json());
    if(session.role==='KITCHEN'&&(v.paymentStatus!==undefined || (v.status&&!['RECEIVED','CONFIRMED','PREPARING','READY'].includes(v.status))))return NextResponse.json({error:'Sem permissão para esta operação'},{status:403});
    const updated=await db.$transaction(async tx=>{
      const curr=await tx.order.findUnique({where:{id:v.id},include:{delivery:{select:{id:true,driverId:true,status:true}}}});
      if(!curr)throw Error('Pedido não encontrado');
      if(v.status)validateOrderStatusChange(curr.kind,curr.status,v.status,Boolean(curr.delivery?.driverId));
      if(v.paymentStatus)validatePaymentChange(v.status??curr.status,curr.paymentStatus,v.paymentStatus);
      const statusChanged=Boolean(v.status&&v.status!==curr.status);
      const paymentChanged=Boolean(v.paymentStatus&&v.paymentStatus!==curr.paymentStatus);
      if(!statusChanged&&!paymentChanged)return curr;
      const changed=await tx.order.updateMany({where:{id:v.id,status:curr.status,paymentStatus:curr.paymentStatus},data:{...(statusChanged?{status:v.status,completedAt:v.status==='COMPLETED'?new Date():null}:{}),...(paymentChanged?{paymentStatus:v.paymentStatus}:{})}});
      if(changed.count!==1)throw Error('O pedido foi alterado em outro dispositivo. Atualize a tela.');
      if(statusChanged){
        await tx.orderEvent.create({data:{orderId:v.id,fromStatus:curr.status,toStatus:v.status!,note:v.note,actorId:session.id}});
        if(v.status==='CANCELED'&&curr.delivery&&!['DELIVERED','FAILED'].includes(curr.delivery.status))await tx.delivery.update({where:{id:curr.delivery.id},data:{status:'FAILED',lastLat:null,lastLng:null,lastAccuracy:null,lastGpsAt:null}});
        if(v.status==='DISPATCHED'&&curr.delivery?.status!=='ON_ROUTE')await tx.delivery.update({where:{id:curr.delivery!.id},data:{status:'ON_ROUTE',startedAt:new Date()}});
        if(v.status==='DELIVERED'&&curr.delivery&&!['DELIVERED','FAILED'].includes(curr.delivery.status))await tx.delivery.update({where:{id:curr.delivery.id},data:{status:'DELIVERED',completedAt:new Date(),lastLat:null,lastLng:null,lastAccuracy:null,lastGpsAt:null}});
      }
      await tx.auditLog.create({data:{actorId:session.id,action:'ORDER_UPDATE',entityType:'Order',entityId:v.id,details:{oldStatus:curr.status,newStatus:v.status,oldPaymentStatus:curr.paymentStatus,newPaymentStatus:v.paymentStatus,note:v.note} as any}});
      return tx.order.findUniqueOrThrow({where:{id:v.id}});
    });
    return NextResponse.json({order:updated});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao atualizar'},{status:409});}
}
