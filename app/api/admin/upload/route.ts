import {NextResponse} from 'next/server';
import {requireRole} from '@/lib/security';
import {sharpProcess} from '@/lib/image-process';
export const runtime='nodejs';
/** Upload de imagens do painel: converte PNG/JPEG grandes para WebP otimizado e descarta o original. */
export async function POST(req:Request){
  const user=await requireRole(['ADMIN','MANAGER','CASHIER']);
  if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
  try{
    const form=await req.formData();
    const file=form.get('file');
    if(!(file instanceof File))return NextResponse.json({error:'Arquivo ausente'},{status:400});
    const result=await sharpProcess(file);
    return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:'Não foi possível processar a imagem'},{status:400});
  }
}
