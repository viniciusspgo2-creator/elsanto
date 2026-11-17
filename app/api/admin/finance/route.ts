import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
import {restaurantPeriodStarts} from '@/lib/business-time';

const createSchema=z.object({
  direction:z.enum(['INCOME','OUTFLOW']),
  kind:z.enum(['REVENUE','EXPENSE','PAYABLE','RECEIVABLE']),
  description:z.string().min(2).max(200),
  category:z.string().min(1).max(80).default('Geral'),
  amountCents:z.number().int().min(1).max(1_000_000_00),
  method:z.string().max(40).default(''),
  dueDate:z.string().datetime().nullable().optional(),
});
const patchSchema=z.object({id:z.string().min(1),paid:true});

export async function GET(){
  if(!await requireRole(['ADMIN','MANAGER','CASHIER']))return NextResponse.json({error:'Não autorizado'},{status:401});
  const monthStart=restaurantPeriodStarts().month;
  const monthEnd=new Date(monthStart);monthEnd.setMonth(monthEnd.getMonth()+1);
  const [transactions,entries]=await Promise.all([
    db.financialTransaction.findMany({orderBy:{createdAt:'desc'},take:150}),
    db.expense.findMany({take:100,orderBy:{date:'desc'}}),
  ]);
  const sum=(kind:string,paid:boolean|null)=>transactions.filter(t=>t.kind===kind&&(paid===null?true:(paid?t.paidAt:!t.paidAt))).reduce((a,t)=>a+t.amountCents,0);
  const paidEntries=entries.reduce((a,e)=>a+e.amountCents,0);
  const metrics=await db.order.aggregate({_sum:{totalCents:true},_count:true,where:{paymentStatus:'PAID',completedAt:{gte:monthStart,lt:monthEnd}}});
  const summary={
    monthRevenue:metrics._sum.totalCents||0,
    paidOrdersCount:metrics._count||0,
    monthPaidIncome:sum('REVENUE',true),
    monthPaidExpense:sum('EXPENSE',true)+paidEntries,
    legacyExpensesCents:paidEntries,
    payableOpen:sum('PAYABLE',false),
    receivableOpen:sum('RECEIVABLE',false),
    balance:(metrics._sum.totalCents||0)+sum('REVENUE',true)-sum('EXPENSE',false)-sum('EXPENSE',true)-paidEntries,
  };
  // Fluxo de caixa diário (últimos 30 dias) com entradas confirmadas e saídas lançadas
  const flowStart=new Date();flowStart.setDate(flowStart.getDate()-29);flowStart.setHours(0,0,0,0);
  const [flowOrders,flowTx,flowExp]=await Promise.all([
    db.order.findMany({where:{paymentStatus:'PAID',completedAt:{gte:flowStart}},select:{completedAt:true,totalCents:true}}),
    db.financialTransaction.findMany({where:{paidAt:{gte:flowStart}},select:{paidAt:true,direction:true,amountCents:true}}),
    db.expense.findMany({where:{date:{gte:flowStart}},select:{date:true,amountCents:true}}),
  ]);
  const flow:{date:string;inCents:number;outCents:number}[]=[];
  for(let i=0;i<30;i++){const d=new Date(flowStart);d.setDate(flowStart.getDate()+i);flow.push({date:d.toISOString().slice(0,10),inCents:0,outCents:0});}
  const idx=(d:Date)=>{const k=d.toISOString().slice(0,10);return flow.findIndex(f=>f.date===k)};
  for(const o of flowOrders){const i=idx(o.completedAt!);if(i>=0)flow[i].inCents+=o.totalCents;}
  for(const t of flowTx){const i=idx(t.paidAt!);if(i>=0)(t.direction==='INCOME'?flow[i].inCents+=t.amountCents:flow[i].outCents+=t.amountCents);}
  for(const e of flowExp){const i=idx(e.date);if(i>=0)flow[i].outCents+=e.amountCents;}
  return NextResponse.json({summary,transactions,entries,flow},{headers:{'Cache-Control':'no-store'}});
}

export async function POST(req:Request){
  const user=await requireRole(['ADMIN','MANAGER','CASHIER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{
    const v=createSchema.parse(await req.json());
    const tx=await db.financialTransaction.create({data:{direction:v.direction,kind:v.kind,description:v.description,category:v.category,amountCents:v.amountCents,method:v.method,dueDate:v.dueDate?new Date(v.dueDate):null,paidAt:v.kind==='REVENUE'||v.kind==='EXPENSE'?new Date():null}});
    await db.auditLog.create({data:{actorId:user.id,action:'FINANCE_CREATE',entityType:'FinancialTransaction',entityId:tx.id,details:{kind:v.kind,amountCents:v.amountCents}}});
    return NextResponse.json({transaction:tx},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Lançamento inválido'},{status:400});}
}

export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{
    const v=patchSchema.parse(await req.json());
    const tx=await db.financialTransaction.update({where:{id:v.id},data:{paidAt:new Date()}});
    await db.auditLog.create({data:{actorId:user.id,action:'FINANCE_SETTLE',entityType:'FinancialTransaction',entityId:tx.id}});
    return NextResponse.json({transaction:tx});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Falha ao atualizar'},{status:400});}
}

export async function DELETE(req:Request){
  const user=await requireRole(['ADMIN','MANAGER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{
    const {id}=z.object({id:z.string().min(1)}).parse(await req.json());
    await db.financialTransaction.delete({where:{id}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({error:'Falha ao excluir lançamento'},{status:400});}
}
