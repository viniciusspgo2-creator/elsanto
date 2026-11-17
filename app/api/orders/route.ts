import {NextResponse} from 'next/server';
import {orderInput} from '@/lib/validation';
import {createOrder,OrderError} from '@/lib/order-service';
import {databaseConfigured} from '@/lib/db';
import {checkLimit,sourceIp} from '@/lib/request-limiter';
export async function POST(req:Request){const limit=checkLimit('public-order',sourceIp(req),24,60_000);if(!limit.allowed)return NextResponse.json({error:'Muitas tentativas. Tente novamente em instantes.'},{status:429,headers:{'Retry-After':String(limit.retryAfter)}});if(!databaseConfigured())return NextResponse.json({error:'Os pedidos serão ativados quando o banco de dados da loja for configurado.'},{status:503});
 try{const input=orderInput.parse(await req.json());const data=await createOrder(input,{allowPos:false});return NextResponse.json(data,{status:201,headers:{'Cache-Control':'no-store'}})}catch(e){if(e instanceof OrderError)return NextResponse.json({error:e.message},{status:e.code});if(e&&typeof e==='object'&&'issues'in e)return NextResponse.json({error:'Revise os dados e produtos do pedido.'},{status:400});console.error('Order create error',e);return NextResponse.json({error:'Não foi possível registrar o pedido. Tente novamente.'},{status:500})}}
