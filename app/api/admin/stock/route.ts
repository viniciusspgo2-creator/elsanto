import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
const schema=z.object({name:z.string().min(2).max(120),unit:z.string().min(1).max(12).default('un'),quantity:z.number().min(0).max(1_000_000),minQuantity:z.number().min(0).max(1_000_000).default(0),costCents:z.number().int().min(0).max(1_000_000_00).nullable().optional(),supplierId:z.string().nullable().optional(),note:z.string().max(500).default('')});
const patch=z.object({id:z.string().min(1),quantity:z.number().min(0).max(1_000_000).optional(),minQuantity:z.number().min(0).max(1_000_000).optional(),unit:z.string().min(1).max(12).optional(),costCents:z.number().int().min(0).max(1_000_000_00).nullable().optional(),supplierId:z.string().nullable().optional(),note:z.string().max(500).optional()});
export async function GET(){
  if(!await requireRole(['ADMIN','MANAGER','CASHIER']))return NextResponse.json({error:'Não autorizado'},{status:401});
  const items=await db.stockItem.findMany({orderBy:{name:'asc'},include:{supplier:{select:{name:true}}}});
  const alerts=items.filter(x=>x.quantity<=x.minQuantity);
  return NextResponse.json({items,alerts:alerts.map(x=>({id:x.id,name:x.name,quantity:x.quantity,minQuantity:x.minQuantity,unit:x.unit}))},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const v=schema.parse(await req.json());const item=await db.stockItem.create({data:{...v,costCents:v.costCents??null,supplierId:v.supplierId||null}});await db.auditLog.create({data:{actorId:user.id,action:'STOCK_CREATE',entityType:'StockItem',entityId:item.id}});return NextResponse.json({item},{status:201});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Insumo inválido (nome já existe?)'},{status:400});}
}
export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN','MANAGER','CASHIER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const v=patch.parse(await req.json());const {id,...data}=v;const item=await db.stockItem.update({where:{id},data:{...data,supplierId:data.supplierId===undefined?undefined:(data.supplierId||null),costCents:data.costCents===undefined?undefined:(data.costCents??null)}});return NextResponse.json({item});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao atualizar'},{status:400});}
}
export async function DELETE(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const {id}=z.object({id:z.string().min(1)}).parse(await req.json());await db.stockItem.delete({where:{id}});return NextResponse.json({ok:true});}
  catch(e){return NextResponse.json({error:'Falha ao excluir'},{status:400});}
}
