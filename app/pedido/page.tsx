'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Search,ArrowRight,ShieldAlert,Clock3,Trash2} from 'lucide-react';
import {parseRecentOrders, type RecentOrder} from '@/lib/recent-orders';
import {publicOrderNumber} from '@/lib/format';
const STORAGE='el-santo-recent-orders-v1';
export default function FindOrder(){
 const [token,setToken]=useState(''),[recent,setRecent]=useState<RecentOrder[]>([]),router=useRouter();
 useEffect(()=>{try{setRecent(parseRecentOrders(localStorage.getItem(STORAGE)))}catch{}},[]);
 function remove(token:string){const next=recent.filter(x=>x.token!==token);setRecent(next);try{localStorage.setItem(STORAGE,JSON.stringify(next))}catch{}}
 return <main className="lookup-page"><section className="container lookup-card"><span className="overline dark">EL SANTO · MEU PEDIDO</span><h1>ONDE ESTÁ<br/><em>MEU PEDIDO?</em></h1><p>Acompanhe suas compras sem criar conta. Neste dispositivo, você encontra os links dos pedidos anteriores.</p>
 {recent.length>0&&<div className="recent-orders"><h2><Clock3 size={20}/> Pedidos salvos neste aparelho</h2>{recent.map(o=><div className="recent-order" key={o.token}><Link href={'/pedido/'+o.token}><b>{publicOrderNumber(o.number)}</b><span>Ver acompanhamento <ArrowRight size={15}/></span></Link><button type="button" onClick={()=>remove(o.token)} aria-label={`Esquecer pedido ${publicOrderNumber(o.number)} neste dispositivo`}><Trash2 size={17}/></button></div>)}</div>}
 <form onSubmit={e=>{e.preventDefault();if(token.trim())router.push('/pedido/'+encodeURIComponent(token.trim()))}}><label>Ou cole seu código privado de acompanhamento</label><div><Search size={20}/><input required value={token} onChange={e=>setToken(e.target.value)} placeholder="Cole o código privado"/><button className="btn btn-red">Acompanhar <ArrowRight size={17}/></button></div></form><small><ShieldAlert size={16}/> O número público sozinho não libera acesso. Em dispositivo compartilhado, remova os links que não deseja manter. Para recuperar um link perdido, consulte a equipe.</small></section></main>;
}
