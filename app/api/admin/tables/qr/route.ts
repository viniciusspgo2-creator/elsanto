import {NextResponse} from 'next/server';
import QRCode from 'qrcode';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
/** QR privado de cadastro; não envia token da mesa para sites de terceiros. */
export async function GET(req:Request){
 const user=await requireRole(['ADMIN','MANAGER','CASHIER']);
 if(!user)return NextResponse.json({error:'Sem permissão'},{status:403});
 const id=new URL(req.url).searchParams.get('id');
 if(!id||id.length>120)return NextResponse.json({error:'Mesa inválida'},{status:400});
 const table=await db.restaurantTable.findUnique({where:{id},select:{shortToken:true,active:true}});
 if(!table)return NextResponse.json({error:'Mesa não encontrada'},{status:404});
 const base=process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin;
 const dest=new URL('/cardapio',base);
 dest.searchParams.set('modo','mesa');dest.searchParams.set('mesa',table.shortToken);
 const svg=await QRCode.toString(dest.toString(),{type:'svg',width:220,margin:1,errorCorrectionLevel:'M',color:{dark:'#231713',light:'#FFFFFF'}});
 return new NextResponse(svg,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
