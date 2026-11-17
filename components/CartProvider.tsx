'use client';
import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import type { PublicItem,ModifierGroup } from '@/lib/menu';
export type CartLine={key:string;id:string;name:string;imageUrl:string;quantity:number;unitCents:number;modifiers:{groupId:string;optionIds:string[]}[];modifierSummary:string[]};
type JustAdded={key:string;name:string;imageUrl:string;quantity:number;at:number};
type CartCtx={lines:CartLine[];add:(item:PublicItem,quantity:number,mods:{groupId:string;optionIds:string[]}[])=>void;remove:(key:string)=>void;changeQty:(key:string,qty:number)=>void;clear:()=>void;open:boolean;setOpen:(value:boolean)=>void;subtotal:number;count:number;justAdded:JustAdded|null;dismissAdded:()=>void};
const Context=createContext<CartCtx|null>(null);
export const useCart=()=>{const c=useContext(Context);if(!c)throw new Error('Missing CartProvider');return c;};
export function CartProvider({children}:{children:React.ReactNode}){
 const [lines,setLines]=useState<CartLine[]>([]),[open,setOpen]=useState(false),[ready,setReady]=useState(false),[justAdded,setJustAdded]=useState<JustAdded|null>(null);
 useEffect(()=>{try{const data=JSON.parse(localStorage.getItem('el-santo-cart-v1')||'[]');if(Array.isArray(data))setLines(data.filter(x=>x&&typeof x.id==='string'&&typeof x.unitCents==='number'&&typeof x.quantity==='number'));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)localStorage.setItem('el-santo-cart-v1',JSON.stringify(lines));},[lines,ready]);
 useEffect(()=>{if(!justAdded)return;const t=setTimeout(()=>setJustAdded(null),4500);return()=>clearTimeout(t);},[justAdded]);
 const add=(item:PublicItem,quantity:number,mods:{groupId:string;optionIds:string[]}[])=>{
  if(item.priceCents===null||!item.available)return;
  const summary:string[]=[];let extras=0;
  for(const sel of mods){const group=item.modifiers.find((g:ModifierGroup)=>g.id===sel.groupId);for(const opId of sel.optionIds){const opt=group?.options.find(o=>o.id===opId);if(opt){summary.push(`${group?.name}: ${opt.name}`);extras+=opt.priceCents;}}}
  const normalized=mods.map(x=>({groupId:x.groupId,optionIds:[...x.optionIds].sort()})).sort((a,b)=>a.groupId.localeCompare(b.groupId));
  const key=item.id+'|'+JSON.stringify(normalized); const line:CartLine={key,id:item.id,name:item.name,imageUrl:item.imageUrl,quantity,unitCents:item.priceCents+extras,modifiers:normalized,modifierSummary:summary};
  setLines(prev=>{const match=prev.find(x=>x.key===key);return match?prev.map(x=>x.key===key?{...x,quantity:Math.min(30,x.quantity+quantity)}:x):[...prev,line]});
  setJustAdded({key,name:item.name,imageUrl:item.imageUrl,quantity,at:Date.now()});
 };
 const value=useMemo<CartCtx>(()=>({lines,add,remove:key=>setLines(v=>v.filter(x=>x.key!==key)),changeQty:(key,qty)=>setLines(v=>v.map(x=>x.key===key?{...x,quantity:Math.max(1,Math.min(30,qty))}:x)),clear:()=>setLines([]),open,setOpen,subtotal:lines.reduce((s,x)=>s+x.quantity*x.unitCents,0),count:lines.reduce((s,x)=>s+x.quantity,0),justAdded,dismissAdded:()=>setJustAdded(null)}),[lines,open,justAdded]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
