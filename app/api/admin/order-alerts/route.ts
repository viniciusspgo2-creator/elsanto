import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
export async function GET(){
  const user=await requireRole(['ADMIN','MANAGER','CASHIER']);
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const [count,recent]=await Promise.all([
    db.order.count({where:{status:'RECEIVED'}}),
    db.order.findMany({where:{status:'RECEIVED'},select:{id:true,number:true,createdAt:true},orderBy:{createdAt:'desc'},take:20}),
  ]);
  return NextResponse.json({count,recent},{headers:{'Cache-Control':'private, no-store'}});
}
