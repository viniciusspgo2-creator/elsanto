import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
export async function GET(){
  if(!await requireRole(['ADMIN','MANAGER']))return NextResponse.json({error:'Não autorizado'},{status:401});
  const staff=await db.staffUser.findMany({select:{id:true,name:true,email:true,role:true,active:true,createdAt:true,driver:{select:{id:true,availability:true}}},orderBy:{createdAt:'asc'},take:200});
  return NextResponse.json({staff},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req:Request){
  const user=await requireRole(['ADMIN']);
  if(!user)return NextResponse.json({error:'Somente o administrador altera acessos'},{status:403});
  try{
    const v=z.object({id:z.string().min(1),active:z.boolean().optional(),password:z.string().min(12).max(100).optional()}).parse(await req.json());
    const {id,...data}=v;
    if(data.password){const {passwordHash}=await import('@/lib/security');await db.staffUser.update({where:{id},data:{...data,passwordHash:passwordHash(data.password)}});}
    else await db.staffUser.update({where:{id},data});
    await db.auditLog.create({data:{actorId:user.id,action:'STAFF_UPDATE',entityType:'StaffUser',entityId:id,details:{keys:Object.keys(data)}}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Dados inválidos (senha 12+ caracteres)'},{status:400});}
}
