import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {mayReassignDelivery} from '@/lib/delivery-state';
import {z} from 'zod';
const input=z.object({orderId:z.string().min(1),driverId:z.string().min(1)});
export async function GET(){
  if(!await requireRole(['ADMIN','MANAGER','CASHIER'])) return NextResponse.json({error:'Não autorizado'},{status:401});
  const dayStart=new Date();dayStart.setHours(0,0,0,0);
  const [deliveries,drivers,deliveredAll,deliveredToday]=await Promise.all([
    db.delivery.findMany({include:{order:{select:{id:true,number:true,customerName:true,customerPhone:true,address:true,status:true,totalCents:true,createdAt:true}},driver:{include:{staff:{select:{name:true}}}}},orderBy:{assignedAt:'desc'},take:100}),
    db.deliveryDriver.findMany({include:{staff:{select:{name:true,email:true,active:true}}},orderBy:{id:'asc'}}),
    db.delivery.groupBy({by:['driverId'],_count:{_all:true},where:{status:'DELIVERED',driverId:{not:null}}}),
    db.delivery.groupBy({by:['driverId'],_count:{_all:true},where:{status:'DELIVERED',driverId:{not:null},completedAt:{gte:dayStart}}}),
  ]);
  const allMap=new Map(deliveredAll.map(r=>[r.driverId,r._count._all]));
  const todayMap=new Map(deliveredToday.map(r=>[r.driverId,r._count._all]));
  const stats=drivers.map(d=>({driverId:d.id,name:d.staff.name,active:d.staff.active,today:todayMap.get(d.id)||0,total:allMap.get(d.id)||0}));
  return NextResponse.json({deliveries,drivers,stats},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{
    const v=input.parse(await req.json());
    const result=await db.$transaction(async tx=>{
      const driver=await tx.deliveryDriver.findUnique({where:{id:v.driverId},include:{staff:{select:{active:true}}}});
      if(!driver?.staff.active)throw Error('Entregador inexistente ou desativado');
      const current=await tx.delivery.findUnique({where:{orderId:v.orderId},include:{order:{select:{status:true,kind:true}}}});
      if(!current || current.order.kind!=='DELIVERY')throw Error('Pedido de entrega não encontrado');
      if(!mayReassignDelivery(current.status)||['DISPATCHED','DELIVERED','COMPLETED','CANCELED'].includes(current.order.status))throw Error('Entrega já iniciada ou encerrada; registre uma ocorrência antes de alterar o entregador');
      const updated=await tx.delivery.updateMany({where:{id:current.id,status:current.status,driverId:current.driverId},data:{driverId:v.driverId,assignedAt:new Date(),status:'ASSIGNED',lastLat:null,lastLng:null,lastAccuracy:null,lastGpsAt:null}});
      if(updated.count!==1)throw Error('Esta entrega foi alterada em outro dispositivo. Atualize a lista.');
      await tx.auditLog.create({data:{actorId:user.id,action:'DELIVERY_ASSIGN',entityType:'Delivery',entityId:current.id,details:{fromDriverId:current.driverId,toDriverId:v.driverId}}});
      return tx.delivery.findUniqueOrThrow({where:{id:current.id}});
    });
    return NextResponse.json({delivery:result});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao atribuir'},{status:409});}
}
