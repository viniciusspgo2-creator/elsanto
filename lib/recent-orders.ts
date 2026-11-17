/** Armazenamento local, por dispositivo, de links privados. Não guarda endereço ou telefone. */
export type RecentOrder={token:string;number:number;createdAt:string};
const valid=(x:unknown):x is RecentOrder=>typeof x==='object'&&x!==null&&typeof (x as RecentOrder).token==='string'&&/^[A-Za-z0-9_-]{32,128}$/.test((x as RecentOrder).token)&&Number.isSafeInteger((x as RecentOrder).number)&&typeof (x as RecentOrder).createdAt==='string';
export function parseRecentOrders(raw:string|null):RecentOrder[]{
 try{const all=JSON.parse(raw||'[]') as unknown;return Array.isArray(all)?all.filter(valid).slice(0,6):[];}catch{return []}
}
export function addRecentOrder(existing:RecentOrder[],next:RecentOrder):RecentOrder[]{
 if(!valid(next))return existing.slice(0,6);
 return [next,...existing.filter(x=>x.token!==next.token)].slice(0,6);
}
