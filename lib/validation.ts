import { z } from 'zod';
export const modifierSelection=z.object({groupId:z.string().min(1),optionIds:z.array(z.string()).max(12)});
export const orderInput=z.object({
  idempotencyKey:z.string().uuid(),
  customerName:z.string().trim().min(2).max(100),
  customerPhone:z.string().trim().max(25).optional().default(''),
  kind:z.enum(['DELIVERY','TAKEAWAY','DINE_IN']),
  source:z.enum(['WEB','TABLE','POS']).default('WEB'),
  tableToken:z.string().optional(),
  paymentMethod:z.enum(['PIX','CREDIT','DEBIT','CASH','ON_DELIVERY']).optional(),
  address:z.object({street:z.string().trim().max(120),number:z.string().trim().max(20),neighborhood:z.string().trim().max(80),city:z.string().trim().max(100).optional(),state:z.string().trim().max(2).optional(),zip:z.string().trim().max(12).optional(),complement:z.string().trim().max(120).optional()}).optional(),
  note:z.string().max(1000).optional(),
  discountCents:z.number().int().min(0).max(10_000_000).optional(),
  items:z.array(z.object({menuItemId:z.string().min(1),quantity:z.number().int().min(1).max(30),modifiers:z.array(modifierSelection).max(12).default([])})).min(1).max(50)
}).superRefine((v,ctx)=>{
 if(v.kind==='DELIVERY'&&(!v.address?.street||!v.address?.number||!v.address?.neighborhood||!v.customerPhone)){ctx.addIssue({code:'custom',message:'Informe endereço completo e WhatsApp para entrega'});}
 if(v.source==='TABLE'&&v.kind!=='DINE_IN')ctx.addIssue({code:'custom',message:'Pedidos feitos por QR Code devem ser do tipo mesa'});
 if(v.kind==='DINE_IN'&&v.source!=='POS'&&!v.tableToken)ctx.addIssue({code:'custom',message:'Escaneie o QR Code da sua mesa para fazer o pedido'});
});
