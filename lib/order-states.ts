import type {OrderStatus} from '@prisma/client';
export const ORDER_TRANSITIONS:Record<OrderStatus,OrderStatus[]>={
 RECEIVED:['CONFIRMED','CANCELED'], CONFIRMED:['PREPARING','CANCELED'],PREPARING:['READY','CANCELED'],READY:['DISPATCHED','COMPLETED','CANCELED'],DISPATCHED:['DELIVERED','CANCELED'],DELIVERED:['COMPLETED'],COMPLETED:[],CANCELED:[]
};
export const ORDER_LABELS:Record<OrderStatus,string>={RECEIVED:'Recebido',CONFIRMED:'Confirmado',PREPARING:'Preparando',READY:'Pronto',DISPATCHED:'Em entrega',DELIVERED:'Entregue',COMPLETED:'Finalizado',CANCELED:'Cancelado'};
