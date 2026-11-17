import {NextResponse} from 'next/server';
import {z} from 'zod';
import {databaseConfigured} from '@/lib/db';
import {checkLimit,sourceIp} from '@/lib/request-limiter';
import {quoteDelivery,DeliveryPricingError} from '@/lib/delivery-pricing';
const schema=z.object({address:z.object({street:z.string().trim().max(120).default(''),number:z.string().trim().max(20).default(''),neighborhood:z.string().trim().max(80),city:z.string().trim().max(100).optional(),state:z.string().trim().max(2).optional(),zip:z.string().trim().max(12).optional()}),subtotalCents:z.number().int().min(0).max(10000000)});
export async function POST(req:Request){const limit=checkLimit('delivery-quote',sourceIp(req),40,60_000);if(!limit.allowed)return NextResponse.json({error:'Muitas consultas seguidas. Tente novamente em instantes.'},{status:429,headers:{'Retry-After':String(limit.retryAfter)}});if(!databaseConfigured())return NextResponse.json({error:'Loja ainda sem banco configurado.'},{status:503});try{const body=schema.parse(await req.json());const quote=await quoteDelivery(body.address,body.subtotalCents);return NextResponse.json({quote},{headers:{'Cache-Control':'no-store'}});}catch(e){return NextResponse.json({error:e instanceof DeliveryPricingError?e.message:'Endereço ou valor inválido'},{status:e instanceof DeliveryPricingError?e.code:400})}}
