'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {Bell,BellRing,BellOff} from 'lucide-react';
type Alert={id:string;number:number;createdAt:string};
export function AdminOrderAlerts(){
  const [count,setCount]=useState<number|null>(null),[sound,setSound]=useState(false),[notice,setNotice]=useState(false);
  const previous=useRef<Set<string>|null>(null),audioContext=useRef<AudioContext|null>(null);
  useEffect(()=>{
    let active=true;
    async function poll(){
      if(document.visibilityState==='hidden')return;
      try{
        const res=await fetch('/api/admin/order-alerts',{cache:'no-store'});
        if(!res.ok)return;
        const data=await res.json() as {count:number;recent:Alert[]};
        if(!active)return;
        const current=new Set((data.recent||[]).map(x=>x.id));
        const hasNew=previous.current!==null&&(data.recent||[]).some(x=>!previous.current!.has(x.id));
        previous.current=current;
        setCount(data.count);
        if(hasNew){setNotice(true);
          if(sound){try{const audio=new Audio('/audio/novo-pedido.mp3');audio.volume=.9;void audio.play().catch(()=>{if(audioContext.current)beepFallback(audioContext.current)})}catch{/* sem áudio */}}
        }
      }catch{/* Panel remains usable during temporary network interruptions. */}
    }
    function beepFallback(ctx:AudioContext){try{const now=ctx.currentTime;for(const [i,freq] of [680,920].entries()){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0.0001,now+i*.15);gain.gain.exponentialRampToValueAtTime(.09,now+i*.15+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.15+.12);osc.connect(gain).connect(ctx.destination);osc.start(now+i*.15);osc.stop(now+i*.15+.13);}}catch{}}
    void poll();const timer=window.setInterval(()=>void poll(),20000);
    return()=>{active=false;window.clearInterval(timer)};
  },[sound]);
  useEffect(()=>()=>{void audioContext.current?.close()},[]);
  async function toggleSound(){
    if(sound){setSound(false);return;}
    try{if(!audioContext.current)audioContext.current=new AudioContext();await audioContext.current.resume();setSound(true)}catch{setSound(false)}
  }
  return <div className="admin-alert-controls">
    <Link href="/admin/pedidos" className={'admin-alert-link'+(notice?' has-new':'')} onClick={()=>setNotice(false)} title="Pedidos recebidos" aria-label={`Pedidos aguardando: ${count??'carregando'}`}>
      {notice?<BellRing size={19}/>:<Bell size={19}/>}<span className="admin-alert-count">{count??'—'}</span>
    </Link>
    <button type="button" className="admin-alert-sound" onClick={()=>void toggleSound()} title={sound?'Desativar som de novos pedidos':'Ativar som de novos pedidos'} aria-label={sound?'Desativar som':'Ativar som'}>{sound?<BellRing size={18}/>:<BellOff size={18}/>}</button>
  </div>;
}
