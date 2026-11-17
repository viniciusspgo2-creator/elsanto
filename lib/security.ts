import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserRole } from '@prisma/client';
import { db, databaseConfigured } from './db';
export function makeToken(){return randomBytes(32).toString('base64url');}
export function tokenHash(t:string){return createHash('sha256').update(t).digest('hex');}
export function passwordHash(password:string){const salt=randomBytes(16).toString('hex');const key=scryptSync(password,salt,64).toString('hex');return `${salt}:${key}`;}
export function verifyPassword(password:string,stored:string){const [salt,hash]=stored.split(':');if(!salt||!hash||hash.length!==128)return false;const actual=scryptSync(password,salt,64),expected=Buffer.from(hash,'hex');return expected.length===actual.length&&timingSafeEqual(actual,expected);}
function secret(){const s=process.env.AUTH_SECRET;if(!s||s.length<32)throw new Error('AUTH_SECRET must be at least 32 characters');return new TextEncoder().encode(s);}
export type Session={id:string;name:string;role:UserRole};
export async function createSession(session:Session){return new SignJWT({name:session.name,role:session.role}).setProtectedHeader({alg:'HS256'}).setSubject(session.id).setIssuedAt().setExpirationTime('12h').sign(secret());}
export async function sessionFromCookie():Promise<Session|null>{try{const raw=(await cookies()).get('elsanto_session')?.value;if(!raw)return null;const data=await jwtVerify(raw,secret());if(!data.payload.sub||typeof data.payload.name!=='string'||typeof data.payload.role!=='string')return null;return{id:data.payload.sub,name:data.payload.name,role:data.payload.role as UserRole};}catch{return null;}}
export async function requireRole(roles:UserRole[]){const s=await sessionFromCookie();if(!s||!roles.includes(s.role)||!databaseConfigured())return null;try{const current=await db.staffUser.findUnique({where:{id:s.id},select:{active:true,role:true}});return current?.active&&current.role===s.role?s:null;}catch{return null;}}
export const SESSION_COOKIE='elsanto_session';
export const isSecureCookie=process.env.NODE_ENV==='production';

export function trackingTokenForKey(key:string){const secretValue=process.env.AUTH_SECRET;if(!secretValue||secretValue.length<32)throw new Error('AUTH_SECRET must be configured');return createHmac('sha256',secretValue).update('el-santo-track:v1:'+key).digest('base64url');}
