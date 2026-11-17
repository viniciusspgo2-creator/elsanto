import {NextResponse} from 'next/server';import {db} from '@/lib/db';import {requireRole} from '@/lib/security';import {restaurantPeriodStarts} from '@/lib/business-time';
export async function GET(){const session=await requireRole(['ADMIN','MANAGER','CASHIER']);if(!session)return NextResponse.json({error:'Não autorizado'},{status:401});
 const {day:today,month}=restaurantPeriodStarts();
 const [todayOrders,monthOrders,paid,expenseAgg,recent,orderStatuses]=await Promise.all([
 db.order.count({where:{createdAt:{gte:today}}}),db.order.count({where:{createdAt:{gte:month}}}),
 db.order.aggregate({where:{createdAt:{gte:month},paymentStatus:'PAID',status:{not:'CANCELED'}},_sum:{totalCents:true},_count:true}),
 db.expense.aggregate({where:{date:{gte:month}},_sum:{amountCents:true}}),
 db.order.findMany({take:8,orderBy:{createdAt:'desc'},select:{id:true,number:true,customerName:true,kind:true,status:true,totalCents:true,createdAt:true}}),
 db.order.groupBy({by:['status'],_count:{_all:true},where:{createdAt:{gte:month}}})
 ]);
 return NextResponse.json({todayOrders,monthOrders,paidRevenueCents:paid._sum.totalCents||0,paidCount:paid._count,expensesCents:expenseAgg._sum.amountCents||0,recent,orderStatuses,averageTicketCents:paid._count?Math.round((paid._sum.totalCents||0)/paid._count):0});}
