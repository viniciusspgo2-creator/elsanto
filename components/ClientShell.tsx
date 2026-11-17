'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect,useState } from 'react';
import { Menu, X, ShoppingBag, Phone, Instagram, MapPin, ChevronDown, MessageCircle, Bot, ArrowUpRight, Search, ArrowRight } from 'lucide-react';
import {CartProvider,useCart} from './CartProvider';
import {ScrollExperience} from './ScrollExperience';
import {CartDrawer} from './CartDrawer';
type Settings={whatsapp:string;announcement:string;promoEnabled:boolean;promoImageUrl:string|null;promoTitle:string|null;restaurantOpenOverride:boolean|null};
export function ClientShell({children,settings}:{children:React.ReactNode;settings:Settings}){return <CartProvider><Header settings={settings}/>{children}<Footer whatsapp={settings.whatsapp}/><Support whatsapp={settings.whatsapp}/><CartDrawer whatsapp={settings.whatsapp} initialAccepting={settings.restaurantOpenOverride!==false}/><AddedToast/><Promo settings={settings}/><ScrollExperience/><RegisterPWA/></CartProvider>}
function AddedToast(){const cart=useCart();const item=cart.justAdded;if(!item)return null;return <div className="added-toast" role="status"><img src={item.imageUrl} alt=""/><div><strong>Adicionado ao pedido <Check2 size={15}/></strong><span>{item.quantity}× {item.name}</span></div><div className="added-actions"><button className="btn btn-red" onClick={()=>cart.setOpen(true)}>Ver carrinho</button><button className="btn btn-ghost" onClick={()=>cart.dismissAdded()}>Continuar escolhendo</button></div></div>}
const Check2=(p:{size:number})=><svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const links=[{label:'Início',url:'/'},{label:'Cardápio',url:'/cardapio'},{label:'Sobre nós',url:'/sobre'},{label:'Contato',url:'/contato'}];
function Header({settings}:{settings:Settings}){
 const [mobile,setMobile]=useState(false);const path=usePathname(),cart=useCart(); const internal=path.startsWith('/admin')||path.startsWith('/entregador');
 useEffect(()=>setMobile(false),[path]);
 useEffect(()=>{
   if(!mobile)return;
   const previous=document.body.style.overflow;
   document.body.style.overflow='hidden';
   const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobile(false)};
   window.addEventListener('keydown',onEscape);
   return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onEscape)};
 },[mobile]);
 if(internal)return null;
 return <>
  {settings.restaurantOpenOverride===false&&<div className="store-paused" role="status">Pedidos online temporariamente pausados. Você ainda pode explorar nosso cardápio e falar com a equipe.</div>}
  <div className="eyebrow-banner"><span>✦</span> {settings.announcement} <span>✦</span><span className="banner-right">São José do Rio Preto · SP</span></div>
  <header className="site-header">
    <div className="container navbar">
      <Link href="/" className="brand" aria-label="El Santo - Página inicial"><Image src="/images/el-santo-logo.png" alt="El Santo Cocina Mexicana" width={132} height={125} priority /></Link>
      <nav id="public-main-navigation" className={'desktop-nav '+(mobile?'open':'')} aria-label="Menu principal">
        {links.map(l=><Link key={l.url} href={l.url} aria-current={path===l.url?'page':undefined} className={path===l.url?'active':''}>{l.label}</Link>)}
        <div className="mobile-nav-quick">
          <Link href="/pedido" onClick={()=>setMobile(false)}><Search size={18}/> Acompanhar pedido <ArrowUpRight size={17}/></Link>
          <Link href="/cardapio" onClick={()=>setMobile(false)}><ShoppingBag size={18}/> Fazer meu pedido <ArrowUpRight size={17}/></Link>
        </div>
      </nav>
      <div className="nav-actions">
        <Link className="follow-order" href="/pedido"><Search size={16}/> Acompanhe seu pedido <ArrowUpRight size={15}/></Link>
        <Link href="/pedido" className="mobile-track" aria-label="Acompanhar meu pedido"><Search size={20}/></Link>
        <button className="cart-pill" onClick={()=>cart.setOpen(true)} aria-label={`Abrir carrinho com ${cart.count} itens`}><ShoppingBag size={19}/><span>{cart.count}</span></button>
        <Link href="/cardapio" className="btn btn-red nav-order">Pedir agora <ArrowUpRight size={17}/></Link>
        <button className="mobile-toggle" aria-controls="public-main-navigation" aria-expanded={mobile} aria-label={mobile?'Fechar menu':'Abrir menu'} onClick={()=>setMobile(x=>!x)}>{mobile?<X/>:<Menu/>}</button>
      </div>
    </div>
  </header>
  {mobile&&<button className="mobile-nav-scrim" aria-label="Fechar menu de navegação" onClick={()=>setMobile(false)}/>}
 </>;
}
function Footer({whatsapp}:{whatsapp:string}){const path=usePathname();if(path.startsWith('/admin')||path.startsWith('/entregador'))return null;return <footer className="site-footer"><div className="container footer-grid"><div><Image src="/images/el-santo-logo.png" alt="El Santo" width={130} height={130}/><p>Cultura e ancestralidade mexicana com um toque autoral.</p><span className="footer-script">Cocina • Fuego • Tradición</span></div><div><h4>Explore</h4>{links.map(x=><Link key={x.url} href={x.url}>{x.label}</Link>)}<Link href="/pedido">Acompanhe seu pedido</Link><Link href="/blog">Blog & novidades</Link></div><div><h4>Venha viver El Santo</h4><p>R. Saldanha Marinho, 4011<br/>Vila Santo Antônio<br/>São José do Rio Preto — SP</p><a href="https://www.google.com/maps/search/?api=1&query=R.%20Saldanha%20Marinho%2C%204011%2C%20S%C3%A3o%20Jos%C3%A9%20do%20Rio%20Preto%20SP" target="_blank" rel="noreferrer"><MapPin size={16}/> Como chegar</a></div><div><h4>Conecte-se</h4><a href="https://www.instagram.com/elsantorp/" target="_blank" rel="noreferrer"><Instagram size={16}/> @elsantorp</a><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a><p className="footer-mini">Feito para quem valoriza uma boa experiência à mesa.</p></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} El Santo Cocina Mexicana.</span><span>Hecho con fuego. Hecho con alma. ✦</span></div></footer>}
function Support({whatsapp}:{whatsapp:string}){const path=usePathname(),[expanded,setExpanded]=useState(false),[chat,setChat]=useState(false),[message,setMessage]=useState(''),[history,setHistory]=useState<{role:'assistant'|'user';text:string;items?:{name:string;priceCents:number|null;imageUrl:string}[];suggestions?:string[]}[]>([{role:'assistant',text:'¡Hola! Sou o assistente do El Santo. Posso indicar pratos, bebidas, valores, nosso endereço e como pedir. O que você procura?'}]),[busy,setBusy]=useState(false);if(path.startsWith('/admin')||path.startsWith('/entregador'))return null;
 async function send(value:string){if(!value.trim()||busy)return;setHistory(v=>[...v,{role:'user',text:value}]);setMessage('');setBusy(true);try{const r=await fetch('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:value})});const data=await r.json();setHistory(v=>[...v,{role:'assistant',text:data.reply||'Não consegui responder agora. Chame a equipe pelo WhatsApp.',items:data.items||[],suggestions:data.suggestions||[]}]);}catch{setHistory(v=>[...v,{role:'assistant',text:'Estou sem conexão. Você pode falar com nossa equipe pelo WhatsApp.'}]);}finally{setBusy(false)}}
 return <><div className="support-dock">{expanded&&<div className="support-options"><button onClick={()=>{setChat(true);setExpanded(false)}}><Bot size={20}/> Falar com El Santo</button><a target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}`}><MessageCircle size={20}/> WhatsApp</a><Link href="/pedido" onClick={()=>setExpanded(false)}><Search size={20}/> Meu pedido</Link></div>}<button className="support-main" aria-label={expanded?'Fechar opções de atendimento':'Opções de atendimento'} onClick={()=>setExpanded(v=>!v)}>{expanded?<X/>:<MessageCircle/>}<span>Como podemos ajudar?</span></button></div>{chat&&<div className="chat-window" role="dialog" aria-label="Assistente El Santo"><div className="chat-top"><div><strong>El Santo · Atendimento</strong><small>Cardápio, valores e informações da casa — respostas 100% mecânicas, sem IA</small></div><button aria-label="Fechar chat" onClick={()=>setChat(false)}><X size={20}/></button></div><div className="chat-messages" aria-live="polite">{history.map((h,i)=><div key={i} className={'chat-row '+h.role}><p className={'chat-bubble '+h.role}>{h.text}</p>{h.items&&h.items.length>0&&<div className="chat-cards">{h.items.map((item,j)=><div className="chat-card" key={j}>{item.imageUrl&&<img src={item.imageUrl} alt={item.name} loading="lazy"/>}<div><strong>{item.name}</strong><span>{item.priceCents!==null?`R$ ${(item.priceCents/100).toFixed(2).replace('.',',')}`:'Consulte'}</span></div></div>)}</div>}{h.suggestions&&h.suggestions.length>0&&<div className="chat-suggestions">{h.suggestions.map((s,j)=><button key={j} onClick={()=>void send(s)}>{s}</button>)}</div>}</div>)}{busy&&<p className="chat-bubble assistant">Um instante…</p>}</div><form className="chat-input" onSubmit={e=>{e.preventDefault();send(message)}}><input aria-label="Mensagem" placeholder="Ex.: quero um taco picante / qual o mais pedido?" value={message} onChange={e=>setMessage(e.target.value)}/><button disabled={busy} aria-label="Enviar"><ArrowRight size={19}/></button></form></div>}</>;
}
function Promo({settings}:{settings:Settings}){const [visible,setVisible]=useState(false);useEffect(()=>{if(settings.promoEnabled&&settings.promoImageUrl&&!sessionStorage.getItem('el-santo-promo-viewed')){const t=setTimeout(()=>setVisible(true),1200);return()=>clearTimeout(t)}},[settings.promoEnabled,settings.promoImageUrl]);useEffect(()=>{if(!visible)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onEscape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setVisible(false);sessionStorage.setItem('el-santo-promo-viewed','1')}};document.addEventListener('keydown',onEscape);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onEscape)}},[visible]);if(!visible||!settings.promoImageUrl)return null;const close=()=>{setVisible(false);sessionStorage.setItem('el-santo-promo-viewed','1')};return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Promoção do El Santo" onClick={close}><div className="promo-box" onClick={e=>e.stopPropagation()}><button onClick={close} className="promo-close" aria-label="Fechar promoção"><X/></button><img src={settings.promoImageUrl} alt={settings.promoTitle||'Promoção do El Santo'}/><Link href="/cardapio" onClick={close} className="btn btn-red">Conhecer cardápio <ArrowUpRight size={16}/></Link></div></div>}
function RegisterPWA(){useEffect(()=>{if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});},[]);return null}
