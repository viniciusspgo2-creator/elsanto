import {db} from './db';
import {getSettings} from './catalog';
import {acceptsOrder} from './order-acceptance';
import {quoteDelivery,DeliveryPricingError} from './delivery-pricing';
import {orderInput} from './validation';
import {trackingTokenForKey,tokenHash} from './security';
import {isModifierGroup} from './menu';
import type {ModifierGroup} from './menu';
import {Prisma} from '@prisma/client';
import {z} from 'zod';
type Input=z.infer<typeof orderInput>;
export class OrderError extends Error{constructor(message:string,public code=400){super(message)}}
export async function createOrder(input:Input, options:{allowPos:boolean;actorId?:string}){
 if(input.source==='POS'&&!options.allowPos)throw new OrderError('Origem de pedido não autorizada',403);
 if(input.discountCents!==undefined&&(input.source!=='POS'||!options.allowPos))throw new OrderError('Desconto só pode ser aplicado pelo painel interno',403);
 if(input.kind==='DINE_IN'&&input.source!=='POS'&&!input.tableToken)throw new OrderError('Código da mesa ausente');
 const existing=await db.order.findUnique({where:{idempotencyKey:input.idempotencyKey}});
 if(existing)return {number:existing.number,trackingToken:trackingTokenForKey(input.idempotencyKey),totalCents:existing.totalCents,reused:true};
 const ids=[...new Set(input.items.map(i=>i.menuItemId))];
 const products=await db.menuItem.findMany({where:{id:{in:ids}},include:{category:true}});
 if(products.length!==ids.length)throw new OrderError('Um ou mais itens não estão mais disponíveis. Atualize o cardápio.');
 const byId=new Map(products.map(p=>[p.id,p]));
 let subtotal=0;
 const lines=input.items.map(line=>{
  const p=byId.get(line.menuItemId)!;
  if(!p.published||!p.available||p.priceCents===null)throw new OrderError(`O item ${p.name} não está disponível no momento.`);
  const groups:Array<ModifierGroup>=Array.isArray(p.modifiers)?p.modifiers.filter(isModifierGroup):[];
  const sent=new Map(line.modifiers.map(m=>[m.groupId,m.optionIds]));
  if(line.modifiers.length!==sent.size||line.modifiers.some(x=>!groups.some(g=>g.id===x.groupId)))throw new OrderError('Opções de produto inválidas.');
  let extra=0; const selected:{group:string;option:string;priceCents:number}[]=[];
  for(const group of groups){const opts=sent.get(group.id)||[]; if(opts.length<group.min||opts.length>group.max||new Set(opts).size!==opts.length)throw new OrderError(`Revise as opções de ${p.name}: ${group.name}`);
   for(const optionId of opts){const opt=group.options.find(x=>x.id===optionId);if(!opt||!Number.isSafeInteger(opt.priceCents)||opt.priceCents<0)throw new OrderError('Opção inválida');extra+=opt.priceCents;selected.push({group:group.name,option:opt.name,priceCents:opt.priceCents});}
  }
  const unit=p.priceCents+extra,lineCents=unit*line.quantity;
  if(!Number.isSafeInteger(lineCents)||lineCents>10_000_000)throw new OrderError('Valor excedeu limite permitido.');
  subtotal+=lineCents;
  return{menuItemId:p.id,nameSnapshot:p.name,unitCents:unit,quantity:line.quantity,lineCents,modifiers:selected as unknown as Prisma.InputJsonValue};
 });
 const config=await getSettings();
 if(!acceptsOrder(config.restaurantOpenOverride,input.source))throw new OrderError('Pedidos online temporariamente pausados. Você ainda pode pedir no balcão.');
 if(subtotal<config.minOrderCents)throw new OrderError('O pedido não atingiu o valor mínimo configurado.');
 const discount=input.discountCents??0;
 if(!Number.isSafeInteger(discount)||discount<0||discount>subtotal)throw new OrderError('Desconto acima do valor permitido.');
 let fee=0;
 if(input.kind==='DELIVERY'){try{fee=(await quoteDelivery(input.address!,subtotal)).feeCents;}catch(e){if(e instanceof DeliveryPricingError)throw new OrderError(e.message,e.code);throw e;}}
 if(!Number.isSafeInteger(fee)||fee<0)throw new OrderError('Taxa de entrega inválida');
 let tableId:string|undefined;
 if(input.kind==='DINE_IN'&&input.tableToken){const table=await db.restaurantTable.findFirst({where:{shortToken:input.tableToken,active:true}});if(!table)throw new OrderError('QR Code da mesa não encontrado.');tableId=table.id;}
 const token=trackingTokenForKey(input.idempotencyKey);
 try{
  const o=await db.$transaction(async tx=>{
   const customer=input.customerPhone?await tx.customer.create({data:{name:input.customerName,phone:input.customerPhone}}):null;
   const order=await tx.order.create({data:{trackingTokenHash:tokenHash(token),idempotencyKey:input.idempotencyKey,customerId:customer?.id,customerName:input.customerName,customerPhone:input.customerPhone,kind:input.kind,source:input.source,tableId,paymentMethod:input.paymentMethod||'ON_DELIVERY',address:input.address as Prisma.InputJsonValue|undefined,note:input.note,subtotalCents:subtotal,deliveryFeeCents:fee,discountCents:discount,totalCents:subtotal+fee-discount,items:{create:lines},events:{create:{toStatus:'RECEIVED',note:'Pedido recebido pelo sistema'}}}});
   if(input.kind==='DELIVERY')await tx.delivery.create({data:{orderId:order.id}});
   if(discount>0)await tx.auditLog.create({data:{actorId:options.actorId,action:'POS_DISCOUNT',entityType:'Order',entityId:order.id,details:{discountCents:discount,subtotalCents:subtotal}}});
   return order;
  });
  return{number:o.number,trackingToken:token,totalCents:o.totalCents,reused:false};
 }catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002'){const found=await db.order.findUnique({where:{idempotencyKey:input.idempotencyKey}});if(found)return{number:found.number,trackingToken:token,totalCents:found.totalCents,reused:true}}throw e;}
}
export async function getPublicOrder(token:string){if(!/^[A-Za-z0-9_-]{32,128}$/.test(token))return null;
 const order=await db.order.findUnique({where:{trackingTokenHash:tokenHash(token)},include:{items:true,events:{orderBy:{createdAt:'asc'}},delivery:{select:{status:true,lastLat:true,lastLng:true,lastAccuracy:true,lastGpsAt:true}}}});
 if(!order)return null;
 const loc=order.delivery;
 const activeGps=order.status==='DISPATCHED'&&loc?.status==='ON_ROUTE'&&loc.lastGpsAt&&Date.now()-loc.lastGpsAt.getTime()<20*60_000;
 const publicDelivery=loc?{status:loc.status,lastLat:activeGps?loc.lastLat:null,lastLng:activeGps?loc.lastLng:null,lastGpsAt:activeGps?loc.lastGpsAt:null}:null;
 return {number:order.number,kind:order.kind,createdAt:order.createdAt,status:order.status,paymentStatus:order.paymentStatus,paymentMethod:order.paymentMethod,items:order.items.map(i=>({id:i.id,name:i.nameSnapshot,quantity:i.quantity,unitCents:i.unitCents,lineCents:i.lineCents,modifiers:i.modifiers})),subtotalCents:order.subtotalCents,deliveryFeeCents:order.deliveryFeeCents,discountCents:order.discountCents,totalCents:order.totalCents,events:order.events.map(e=>({toStatus:e.toStatus,note:e.note,at:e.createdAt})),delivery:publicDelivery};
}
