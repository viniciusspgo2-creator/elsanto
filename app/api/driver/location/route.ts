import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {requireRole} from '@/lib/security';
import {z} from 'zod';
const schema=z.object({deliveryId:z.string().min(1),lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),accuracy:z.number().min(0).max(300),capturedAt:z.string().datetime()});
export async function POST(req:Request){
  const user=await requireRole(['DRIVER']);if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  try{
    const v=schema.parse(await req.json());
    const driver=await db.deliveryDriver.findUnique({where:{staffId:user.id}});
    if(!driver?.consentGps)return NextResponse.json({error:'Ative o consentimento de localização.'},{status:403});
    const capture=new Date(v.capturedAt);
    if(Math.abs(Date.now()-capture.getTime())>120000)throw Error('Localização antiga ou relógio do dispositivo incorreto');
    const result=await db.$transaction(async tx=>{
      const updated=await tx.delivery.updateMany({where:{id:v.deliveryId,driverId:driver.id,status:'ON_ROUTE',OR:[{lastGpsAt:null},{lastGpsAt:{lt:capture}}]},data:{lastLat:v.lat,lastLng:v.lng,lastAccuracy:v.accuracy,lastGpsAt:capture}});
      if(!updated.count)return false;
      await tx.deliveryLocation.create({data:{deliveryId:v.deliveryId,lat:v.lat,lng:v.lng,accuracy:v.accuracy,capturedAt:capture}});
      return true;
    });
    return NextResponse.json({ok:true,ignored:!result});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Localização inválida'},{status:400});}
}
