import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {canChangeDelivery} from '@/lib/delivery-state';
import {ORDER_TRANSITIONS} from '@/lib/order-states';
import {z} from 'zod';
const edit=z.object({deliveryId:z.string().min(1),status:z.enum(['ACCEPTED','PICKED_UP','ON_ROUTE','ARRIVED','DELIVERED','FAILED']),note:z.string().max(300).optional()});
export async function GET(){
  const user=await requireRole(['DRIVER']);if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const driver=await db.deliveryDriver.findUnique({where:{staffId:user.id}});
  if(!driver)return NextResponse.json({error:'Entregador não cadastrado'},{status:404});
  const deliveries=await db.delivery.findMany({where:{driverId:driver.id},orderBy:{assignedAt:'desc'},take:50,include:{order:{include:{items:true}}}});
  return NextResponse.json({deliveries,availability:driver.availability,consentGps:driver.consentGps},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req:Request){
  const user=await requireRole(['DRIVER']);if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  try{
    const v=edit.parse(await req.json());
    const driver=await db.deliveryDriver.findUniqueOrThrow({where:{staffId:user.id}});
    const delivery=await db.delivery.findFirst({where:{id:v.deliveryId,driverId:driver.id},include:{order:true}});
    if(!delivery)throw Error('Entrega não atribuída a você');
    if(delivery.status===v.status)return NextResponse.json({ok:true,reused:true});
    if(!canChangeDelivery(delivery.status,v.status))throw Error('Transição não permitida');
    if(['CANCELED','COMPLETED'].includes(delivery.order.status))throw Error('Pedido encerrado; entre em contato com a loja');
    if(v.status==='ON_ROUTE'&&!['READY','DISPATCHED'].includes(delivery.order.status))throw Error('O restaurante ainda não marcou o pedido como pronto');
    if(v.status==='DELIVERED'&&delivery.order.status!=='DISPATCHED')throw Error('O pedido ainda não consta como despachado');
    await db.$transaction(async tx=>{
      const updated=await tx.delivery.updateMany({where:{id:delivery.id,driverId:driver.id,status:delivery.status},data:{status:v.status,startedAt:v.status==='ON_ROUTE'?new Date():undefined,completedAt:v.status==='DELIVERED'?new Date():undefined,...(v.status==='DELIVERED'||v.status==='FAILED'?{lastLat:null,lastLng:null,lastAccuracy:null,lastGpsAt:null}:{})}});
      if(updated.count!==1)throw Error('Entrega atualizada por outro operador. Recarregue os dados.');
      if(v.status==='ON_ROUTE'||v.status==='DELIVERED'){
        const newStatus=v.status==='ON_ROUTE'?'DISPATCHED':'DELIVERED';
        if(delivery.order.status!==newStatus){
          if(!ORDER_TRANSITIONS[delivery.order.status].includes(newStatus))throw Error('Estado do pedido incompatível com a entrega');
          const orderUpdated=await tx.order.updateMany({where:{id:delivery.orderId,status:delivery.order.status},data:{status:newStatus}});
          if(orderUpdated.count!==1)throw Error('Pedido alterado simultaneamente; tente novamente.');
          await tx.orderEvent.create({data:{orderId:delivery.orderId,fromStatus:delivery.order.status,toStatus:newStatus,actorId:user.id,note:'Atualização confirmada pelo entregador'}});
        }
      }
      await tx.auditLog.create({data:{actorId:user.id,action:'DELIVERY_STATUS',entityType:'Delivery',entityId:v.deliveryId,details:{status:v.status,note:v.note||''}}});
      if(v.status==='FAILED')await tx.deliveryIncident.create({data:{deliveryId:v.deliveryId,kind:'FAILED',description:v.note?.trim()||'Ocorrência registrada pelo entregador'}});
    });
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao atualizar entrega'},{status:409});}
}
