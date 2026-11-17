import type {OrderKind,OrderStatus,PaymentStatus} from '@prisma/client';
import {ORDER_TRANSITIONS} from './order-states';
/** Regras de negócio para evitar status incoerentes entre balcão, cozinha e entregas. */
export function validateOrderStatusChange(kind:OrderKind,from:OrderStatus,to:OrderStatus,driverAssigned:boolean){
  if(from===to)return;
  if(!ORDER_TRANSITIONS[from].includes(to))throw Error('Transição de pedido não permitida.');
  if(to==='DISPATCHED' && kind!=='DELIVERY')throw Error('Somente pedidos de delivery podem sair para entrega.');
  if(to==='DISPATCHED' && !driverAssigned)throw Error('Atribua um entregador antes de despachar.');
  if(to==='DELIVERED' && kind!=='DELIVERY')throw Error('Pedido sem delivery não pode usar status entregue.');
  if(to==='COMPLETED' && kind==='DELIVERY' && from!=='DELIVERED')throw Error('Delivery precisa ser entregue antes de finalizar.');
}
export function validatePaymentChange(orderStatus:OrderStatus,current:PaymentStatus,next:PaymentStatus){
  if(next===current)return;
  if(orderStatus==='CANCELED'&&next==='PAID')throw Error('Não confirme novo pagamento de pedido cancelado.');
  if(next==='REFUNDED'&&!['PAID','PARTIALLY_PAID'].includes(current))throw Error('Não é possível estornar um pedido sem pagamento registrado.');
  if(current==='REFUNDED'&&next==='PAID')throw Error('Pagamento estornado deve ser conciliado manualmente.');
}
