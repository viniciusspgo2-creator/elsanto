import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
/** Resolve o nome da mesa a partir do token curto do QR (público, sem dados sensíveis). */
export async function GET(_req:Request,{params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  if(!/^[A-Za-z0-9_-]{8,64}$/.test(token))return NextResponse.json({error:'Token inválido'},{status:400});
  try{
    const table=await db.restaurantTable.findFirst({where:{shortToken:token,active:true},select:{name:true}});
    if(!table)return NextResponse.json({error:'Mesa não encontrada'},{status:404});
    return NextResponse.json({name:table.name},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Mesa indisponível'},{status:503});}
}
