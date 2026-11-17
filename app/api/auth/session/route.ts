import {NextResponse} from 'next/server';import {sessionFromCookie} from '@/lib/security';
export async function GET(){const s=await sessionFromCookie();return NextResponse.json({session:s})}
