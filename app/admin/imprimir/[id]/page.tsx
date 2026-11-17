import {notFound,redirect} from 'next/navigation';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {currency,publicOrderNumber} from '@/lib/format';
import {PrintReceipt} from '@/components/PrintReceipt';
import './print.css';
export const dynamic='force-dynamic';
export default async function PrintOrder({params}:{params:Promise<{id:string}>}){
 const session=await requireRole(['ADMIN','MANAGER','CASHIER','KITCHEN']);
 if(!session)redirect('/admin/login');
 const {id}=await params;
 const order=await db.order.findUnique({where:{id},include:{items:true,table:true}});
 if(!order)notFound();
 const kitchen=session.role==='KITCHEN';
 const address=order.address&&typeof order.address==='object'&&!Array.isArray(order.address)?order.address as unknown as Record<string,string>:null;
 return <div className="receipt-app"><div className="receipt-controls"><div><strong>El Santo · impressão de comanda</strong><small>Este documento não substitui documento fiscal.</small></div><a href="/admin/pedidos">Voltar aos pedidos</a><PrintReceipt/></div><article className="receipt-paper paper-80" id="receipt-print"><header><h1>EL SANTO</h1><p>COCINA • FUEGO • TRADICIÓN</p><hr/><h2>COMANDA NÃO FISCAL</h2><strong>{publicOrderNumber(order.number)}</strong><p>{new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(order.createdAt)}</p></header><hr/><div className="receipt-lines"><p><strong>Tipo:</strong> {order.kind==='DELIVERY'?'ENTREGA':order.kind==='DINE_IN'?'MESA':'RETIRADA'} {order.table?.name||''}</p><p><strong>Cliente:</strong> {order.customerName}</p>{!kitchen&&order.customerPhone&&<p><strong>Telefone:</strong> {order.customerPhone}</p>}{!kitchen&&address&&<p><strong>Endereço:</strong> {[address.street,address.number,address.neighborhood,address.city].filter(Boolean).join(', ')} {address.complement?`— ${address.complement}`:''}</p>}</div><hr/><div className="receipt-lines">{order.items.map(item=><div key={item.id} className="receipt-item"><div><b>{item.quantity}x {item.nameSnapshot}</b><strong>{currency(item.lineCents)}</strong></div>{Array.isArray(item.modifiers)&&item.modifiers.map((m,i)=>{const v=m&&typeof m==='object'&&!Array.isArray(m)?m as Record<string,unknown>:null;return <small key={i}>{v?`${String(v.group||'Opção')}: ${String(v.option||'')}`:''}</small>})}</div>)}</div>{order.note&&<><hr/><p className="receipt-note"><b>OBSERVAÇÕES:</b> {order.note}</p></>}{!kitchen&&<><hr/><div className="receipt-totals"><span>Subtotal <b>{currency(order.subtotalCents)}</b></span><span>Entrega <b>{currency(order.deliveryFeeCents)}</b></span>{order.discountCents>0&&<span>Descontos <b>-{currency(order.discountCents)}</b></span>}<strong>TOTAL <b>{currency(order.totalCents)}</b></strong><span>Pagamento <b>{order.paymentStatus==='PAID'?'CONFIRMADO':'NÃO CONFIRMADO'}</b></span></div></>}<hr/><footer><p>Impresso pelo sistema EL SANTO.</p><p>COMANDA OPERACIONAL • NÃO É CUPOM FISCAL</p></footer></article></div>;
}
