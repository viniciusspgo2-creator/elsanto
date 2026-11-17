import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
const schema=z.object({name:z.string().min(2).max(120),phone:z.string().max(30).default(''),email:z.string().max(120).default(''),category:z.string().max(60).default('Geral'),note:z.string().max(500).default('')});
const patch=z.object({id:z.string().min(1),name:z.string().min(2).max(120).optional(),phone:z.string().max(30).optional(),email:z.string().max(120).optional(),category:z.string().max(60).optional(),note:z.string().max(500).optional(),active:z.boolean().optional()});
export async function GET(){
  if(!await requireRole(['ADMIN','MANAGER','CASHIER']))return NextResponse.json({error:'Não autorizado'},{status:401});
  return NextResponse.json({suppliers:await db.supplier.findMany({orderBy:{name:'asc'},include:{_count:{select:{stock:true}}}})},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const v=schema.parse(await req.json());const supplier=await db.supplier.create({data:v});await db.auditLog.create({data:{actorId:user.id,action:'SUPPLIER_CREATE',entityType:'Supplier',entityId:supplier.id}});return NextResponse.json({supplier},{status:201});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Fornecedor inválido'},{status:400});}
}
export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const v=patch.parse(await req.json());const {id,...data}=v;const supplier=await db.supplier.update({where:{id},data});return NextResponse.json({supplier});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao salvar fornecedor'},{status:400});}
}
export async function DELETE(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const {id}=z.object({id:z.string().min(1)}).parse(await req.json());const used=await db.stockItem.count({where:{supplierId:id}});if(used)return NextResponse.json({error:'Existem insumos vinculados a este fornecedor'},{status:400});await db.supplier.delete({where:{id}});return NextResponse.json({ok:true});}
  catch(e){return NextResponse.json({error:'Falha ao excluir'},{status:400});}
}
