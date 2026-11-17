import {createHash} from 'node:crypto';
/** Proteção básica por instância. Para limites globais em produção, usar storage compartilhado/WAF. */
type Entry={count:number;resetAt:number};
const records=new Map<string,Entry>();
export function checkLimit(namespace:string,identifier:string,limit:number,windowMs:number,now=Date.now()){
 const key=createHash('sha256').update(namespace+':'+identifier).digest('hex');
 if(records.size>5000){for(const [id,e] of records){if(e.resetAt<=now)records.delete(id)}if(records.size>5000)records.clear()}
 const item=records.get(key);
 if(!item||item.resetAt<=now){records.set(key,{count:1,resetAt:now+windowMs});return{allowed:true,retryAfter:0}};
 if(item.count>=limit)return{allowed:false,retryAfter:Math.max(1,Math.ceil((item.resetAt-now)/1000))};
 item.count++;return{allowed:true,retryAfter:0};
}
export function sourceIp(request:Request){return request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'}
