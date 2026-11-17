import {NextResponse} from 'next/server';
import {requireRole} from '@/lib/security';
import {canUpload,presignUpload} from '@/lib/media';
import {z} from 'zod';
const input=z.object({filename:z.string().min(1).max(150),mime:z.string().max(100),size:z.number().int().positive()});
export async function POST(req:Request){
 if(!await requireRole(['ADMIN','MANAGER']))return NextResponse.json({error:'Sem permissão'},{status:403});
 try{
  const value=input.parse(await req.json());
  if(!canUpload(value.mime,value.size))return NextResponse.json({error:'Envie JPG, PNG ou WebP de até 8 MB.'},{status:400});
  return NextResponse.json(presignUpload(value),{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Upload indisponível'},{status:400});}
}
