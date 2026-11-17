import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
const patch=z.object({id:z.string().min(1),name:z.string().min(2).max(100),phone:z.string().max(25).default('')});
export async function GET(req:Request){
  if(!await requireRole(['ADMIN','MANAGER','CASHIER']))return NextResponse.json({error:'Não autorizado'},{status:401});
  const search=new URL(req.url).searchParams.get('q')||'';
  const customers=await db.customer.findMany({
    where:search?{OR:[{name:{contains:search,mode:'insensitive' as const}},{phone:{contains:search}}]}:{},
    include:{orders:{select:{totalCents:true,status:true,createdAt:true}}},
    orderBy:{createdAt:'desc'},take:200,
  }).catch(()=>[]);
  const rows=(customers as unknown as {id:string;name:string;phone:string;createdAt:Date;orders:{totalCents:number;status:string;createdAt:Date}[]}[]).map(c=>({
    id:c.id,name:c.name,phone:c.phone,createdAt:c.createdAt,
    ordersCount:c.orders.length,
    totalCents:c.orders.reduce((a,o)=>a+(o.status==='CANCELED'?0:o.totalCents),0),
    lastOrderAt:c.orders.map(o=>o.createdAt).sort((a,b)=>b.getTime()-a.getTime())[0]||null,
  }));
  return NextResponse.json({customers:rows},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{const v=patch.parse(await req.json());const {id,...data}=v;const customer=await db.customer.update({where:{id},data});return NextResponse.json({customer});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao salvar cliente'},{status:400});}
}
