'use client';

import Link from 'next/link';
import Image from 'next/image';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {
  LayoutDashboard,ClipboardList,UtensilsCrossed,Store,Armchair,Truck,Wallet,
  BadgePercent,Settings,Sun,Moon,LogOut,Menu,X,ChefHat,Users,BadgeCheck,
  Images,Newspaper,ExternalLink
} from 'lucide-react';
import {AdminOrderAlerts} from './AdminOrderAlerts';

type NavItem={href:string;label:string;Icon:typeof LayoutDashboard};
const groups:{title:string;items:NavItem[]}[]=[
  {title:'Visão geral',items:[
    {href:'/admin',label:'Dashboard',Icon:LayoutDashboard},
  ]},
  {title:'Operação da casa',items:[
    {href:'/admin/pedidos',label:'Pedidos',Icon:ClipboardList},
    {href:'/admin/cozinha',label:'Cozinha · KDS',Icon:ChefHat},
    {href:'/admin/pdv',label:'PDV & Balcão',Icon:Store},
    {href:'/admin/mesas',label:'Mesas & QR',Icon:Armchair},
    {href:'/admin/entregas',label:'Entregas',Icon:Truck},
  ]},
  {title:'Relações & cadastros',items:[
    {href:'/admin/clientes',label:'Clientes',Icon:Users},
    {href:'/admin/funcionarios',label:'Funcionários',Icon:BadgeCheck},
  ]},
  {title:'Gestão e conteúdo',items:[
    {href:'/admin/cardapio',label:'Cardápio',Icon:UtensilsCrossed},
    {href:'/admin/financeiro',label:'Financeiro & Estoque',Icon:Wallet},
    {href:'/admin/marketing',label:'Marketing',Icon:BadgePercent},
    {href:'/admin/galeria',label:'Galeria',Icon:Images},
    {href:'/admin/blog',label:'Blog',Icon:Newspaper},
    {href:'/admin/configuracoes',label:'Configurações',Icon:Settings},
  ]}
];

function canShow(href:string,role:string){
  if(role==='KITCHEN')return href==='/admin/cozinha';
  if(role==='CASHIER')return !['/admin/configuracoes','/admin/marketing','/admin/galeria','/admin/blog','/admin/funcionarios'].includes(href);
  return true;
}

export function AdminFrame({children,title,name,role}:{children:React.ReactNode;title:string;name:string;role:string}){
  const path=usePathname();
  const router=useRouter();
  const [theme,setTheme]=useState<'light'|'dark'>('light');
  const [sidebar,setSidebar]=useState(false);
  useEffect(()=>{setTheme(localStorage.getItem('elsanto-admin-theme')==='dark'?'dark':'light')},[]);
  useEffect(()=>setSidebar(false),[path]);
  useEffect(()=>{
    if(!sidebar)return;
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setSidebar(false)};
    window.addEventListener('keydown',escape);
    return()=>window.removeEventListener('keydown',escape);
  },[sidebar]);

  function changeTheme(next:'light'|'dark'){
    setTheme(next);
    localStorage.setItem('elsanto-admin-theme',next);
  }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});router.push('/admin/login');router.refresh()}

  return <div className="admin-app" data-theme={theme}>
    <aside id="admin-navigation" className={'admin-sidebar '+(sidebar?'open':'')} aria-label="Navegação do painel">
      <Link href="/admin" className="admin-brand">
        <Image src="/images/el-santo-logo.png" alt="El Santo" width={112} height={107}/>
        <div><strong>EL SANTO</strong><span>PAINEL DE CONTROLE</span></div>
      </Link>
      <nav aria-label="Seções da administração">
        {groups.map(group=>{
          const items=group.items.filter(x=>canShow(x.href,role));
          if(!items.length)return null;
          return <div key={group.title} className="admin-nav-group">
            <div className="sidebar-section-title">{group.title}</div>
            {items.map(({href,label,Icon})=><Link
              key={href}
              href={href}
              className={path===href?'selected':''}
              aria-current={path===href?'page':undefined}
            ><Icon size={18} strokeWidth={1.9}/><span>{label}</span>{path===href&&<span className="nav-current"/>}</Link>)}
          </div>;
        })}
      </nav>
      <div className="sidebar-lower">
        <div className="sidebar-help"><span className="sidebar-help-mark">✦</span><div><strong>Feito para a sua operação</strong><small>Do primeiro pedido à última entrega.</small></div></div>
        <Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/> Abrir site público</Link>
        <button onClick={logout}><LogOut size={17}/> Sair da conta</button>
      </div>
    </aside>
    <div className="admin-screen">
      <header className="admin-topbar">
        <div className="admin-top-left">
          <button className="admin-menu-toggle" aria-controls="admin-navigation" aria-expanded={sidebar} aria-label={sidebar?'Fechar menu lateral':'Abrir menu lateral'} onClick={()=>setSidebar(v=>!v)}>{sidebar?<X size={21}/>:<Menu size={21}/>}</button>
          <div><span className="admin-breadcrumb">EL SANTO / CONTROLE</span><h1>{title}</h1></div>
        </div>
        <div className="admin-top-actions">
          {role!=='KITCHEN'&&<AdminOrderAlerts/>}
          <div className="admin-theme-switch" role="group" aria-label="Aparência do painel">
            <button type="button" aria-pressed={theme==='light'} onClick={()=>changeTheme('light')} title="Usar tema claro"><Sun size={16}/><span>Claro</span></button>
            <button type="button" aria-pressed={theme==='dark'} onClick={()=>changeTheme('dark')} title="Usar tema escuro"><Moon size={16}/><span>Escuro</span></button>
          </div>
          <span className="admin-user"><b>{name}</b><small>{role}</small></span>
        </div>
      </header>
      <div className="admin-content">{children}</div>
    </div>
    {sidebar&&<button className="sidebar-scrim" aria-label="Fechar menu" onClick={()=>setSidebar(false)}/>}
  </div>;
}
