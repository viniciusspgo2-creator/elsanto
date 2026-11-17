'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Image from 'next/image';
import {ArrowUpRight,Flame,Plus,Minus,Search,X,Check,ShoppingBag,ArrowRight} from 'lucide-react';
import type {PublicItem,ModifierGroup} from '@/lib/menu';
import {useCart} from './CartProvider';
import {currency} from '@/lib/format';
export function MenuGrid({items,compact=false}:{items:PublicItem[];compact?:boolean}){
 const [category,setCategory]=useState('Todos'),[search,setSearch]=useState(''),[selected,setSelected]=useState<PublicItem|null>(null);
 const cats=useMemo(()=>['Todos',...new Set(items.map(i=>i.category))],[items]);
 const visible=useMemo(()=>items.filter(i=>(category==='Todos'||i.category===category)&&(!search||`${i.name} ${i.description}`.toLowerCase().includes(search.toLowerCase()))),[items,category,search]);
 return <><div className="menu-toolbar"><div className="filter-pills" role="group" aria-label="Categorias do cardápio">{cats.map(c=><button type="button" aria-pressed={category===c} className={'filter-pill '+(category===c?'active':'')} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div>{!compact&&<label className="menu-search"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Qual sabor te chama?" aria-label="Buscar no cardápio"/></label>}</div>{!compact&&<p className="menu-results-count" aria-live="polite">{visible.length} {visible.length===1?'item encontrado':'itens encontrados'} no cardápio</p>}<div className={'product-grid '+(compact?'compact':'')}>{visible.map((item,i)=><article className="product-card" key={item.id}><div className="product-image-wrap"><button type="button" className="product-image-button" aria-label={`Ver detalhes e personalizar ${item.name}`} onClick={()=>setSelected(item)}><Image src={item.imageUrl} alt={item.name} unoptimized fill sizes="(max-width:650px) 100vw, (max-width:1024px) 50vw, 33vw" className="cover-img"/></button><span className="product-category">{item.category}</span>{item.featured&&<span className="product-featured"><Flame size={13}/> DESTAQUE</span>}</div><div className="product-info"><h3>{item.name}</h3><p>{item.description}</p><div className="product-bottom"><div><span className="price-label">{item.priceCents!==null?(item.modifiers.some(g=>g.min>0&&g.options.some(o=>o.priceCents>0))?'A partir de':'Preço do cardápio'):'Consulte o cardápio'}</span><strong>{item.priceCents!==null?currency(item.priceCents):'Valor a cadastrar'}</strong></div><button className="round-add" aria-label={`Ver detalhes de ${item.name}`} onClick={()=>setSelected(item)}><Plus size={23}/></button></div>{item.illustrative&&<span className="illustrative-label">Foto ilustrativa de prato da casa · pedidos disponíveis após ativação</span>}</div></article>)}</div>{visible.length===0&&<div className="empty-products">Não encontramos pratos com essa busca. Experimente outra categoria.</div>}{selected&&<ProductModal item={selected} onClose={()=>setSelected(null)}/>}</>
}
export function ProductModal({item,onClose,hideBrowseNote}:{item:PublicItem;onClose:()=>void;hideBrowseNote?:boolean}){
 const [qty,setQty]=useState(1),[selection,setSelection]=useState<Record<string,string[]>>({});const cart=useCart();
 const dialogRef=useRef<HTMLDivElement>(null),closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const previousFocus=document.activeElement as HTMLElement|null;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onClose();return;}
   if(event.key!=='Tab'||!dialogRef.current)return;
   const focusable=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'));
   if(!focusable.length)return;
   if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus();}
   else if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus();}
  };
  document.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',onKey);previousFocus?.focus();};
 },[onClose]);
 const valid=item.modifiers.every(g=>(selection[g.id]||[]).length>=g.min&&(selection[g.id]||[]).length<=g.max);
 const extras=item.modifiers.reduce((total,g)=>total+(selection[g.id]||[]).reduce((s,id)=>s+(g.options.find(o=>o.id===id)?.priceCents||0),0),0);
 const unit=item.priceCents===null?null:item.priceCents+extras;
 const toggle=(g:ModifierGroup,id:string)=>{setSelection(prev=>{const old=prev[g.id]||[];const next=g.max===1?(old.includes(id)?(g.min===0?[]:old):[id]):old.includes(id)?old.filter(x=>x!==id):old.length<g.max?[...old,id]:old;return {...prev,[g.id]:next}})};
 return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Detalhes de ${item.name}`} onClick={onClose}><div className="product-modal" ref={dialogRef} onClick={e=>e.stopPropagation()}><button ref={closeRef} className="modal-close" aria-label="Fechar" onClick={onClose}><X size={20}/></button><div className="modal-photo"><Image src={item.imageUrl} alt={item.name} unoptimized fill sizes="(max-width:700px) 100vw, 42vw" className="cover-img"/><span className="modal-photo-tag">{item.category}</span></div><div className="modal-product-body"><div className="modal-body-scroll"><span className="overline dark">{item.category} · EL SANTO</span><h2>{item.name}</h2><p>{item.description}</p>{item.modifiers.map(g=>{const picked=(selection[g.id]||[]).length;const isRemove=g.name.toLowerCase().startsWith('remover');return <div key={g.id} className={'modifier-group'+(isRemove?' modifier-remove':'')}><div className="modifier-group-head"><h4>{g.name}</h4>{g.required&&<span className="tag-required">Obrigatório</span>}<span className={'group-count'+(picked>0?' has-picks':'')}>{picked}/{g.max}</span></div><small>{isRemove?'Marque o que não quer no seu prato':g.min===g.max?`Escolha ${g.min} ${g.min===1?'opção':'opções'}`:`Escolha de ${g.min} a ${g.max} opções`}</small><div className="modifier-options">{g.options.map(op=><button key={op.id} className={'modifier-option '+((selection[g.id]||[]).includes(op.id)?'selected':'')} onClick={()=>toggle(g,op.id)}><span className="option-dot">{(selection[g.id]||[]).includes(op.id)&&<Check size={12}/>}</span><span className="option-name">{op.name}</span><em>{op.priceCents>0?`+ ${currency(op.priceCents)}`:''}</em></button>)}</div></div>})}</div><div className="modal-footer"><div className="modal-quantity"><span>Quantidade</span><div className="qty-control"><button disabled={qty<=1} onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="Diminuir"><Minus size={16}/></button><strong>{qty}</strong><button disabled={qty>=30} onClick={()=>setQty(q=>Math.min(30,q+1))} aria-label="Aumentar"><Plus size={16}/></button></div></div>{unit!==null&&item.available?<><button className="btn btn-red btn-wide modal-cta" disabled={!valid} onClick={()=>{cart.add(item,qty,item.modifiers.map(g=>({groupId:g.id,optionIds:selection[g.id]||[]})));onClose();}}><ShoppingBag size={18}/> Adicionar · {currency(unit*qty)} <Check size={17}/></button>{!hideBrowseNote&&<small className="modal-continue-note">Você continua escolhendo — o carrinho fica salvo.</small>}</>:<div className="menu-not-ready">Este item aguarda confirmação de preço e disponibilidade pelo restaurante.</div>}</div></div></div></div>
}
