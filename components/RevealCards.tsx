'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

const cards=[
  {title:'Sabores',subtitle:'Do México direto à sua mesa',image:'/images/tacos.jpg',tag:'GASTRONOMIA',url:'/cardapio'},
  {title:'Histórias',subtitle:'Um lugar para viver momentos',image:'/images/interior-neon.jpg',tag:'NOSSA CASA',url:'/sobre'},
  {title:'Experiências',subtitle:'A noite ganha outro sabor',image:'/images/coquetel.jpg',tag:'EL SANTO',url:'/contato'}
];

export function RevealCards(){
  const [active,setActive]=useState<number|null>(null);
  const handleClick=(event:React.MouseEvent<HTMLAnchorElement>,index:number)=>{
    // On touch screens, the first tap opens the editorial card; a second tap follows it.
    if(typeof window!=='undefined'&&window.matchMedia('(hover: none) and (pointer: coarse)').matches&&active!==index){
      event.preventDefault();
      setActive(index);
    }
  };
  return <div className="reveal-cards" aria-label="Explore a experiência El Santo">
    {cards.map((c,i)=><Link
      href={c.url}
      key={c.title}
      className={'reveal-card '+(active===i?'is-active':'')}
      onPointerEnter={e=>{if(e.pointerType==='mouse')setActive(i)}}
      onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))setActive(i)}}
      onClick={e=>handleClick(e,i)}
      aria-label={`${c.title}: ${c.subtitle}`}
    >
      <Image src={c.image} alt={c.subtitle} fill sizes="(max-width:839px) 100vw, (max-width:1200px) 50vw, 35vw" className="cover-img"/>
      <div className="reveal-scrim"/>
      <span className="reveal-index">0{i+1} / {c.tag}</span>
      <div className="reveal-content"><h3>{c.title}</h3><p>{c.subtitle}</p><span className="reveal-explore">Explorar <ArrowUpRight size={17}/></span></div>
      <span className="reveal-arrow" aria-hidden="true"><ArrowUpRight/></span>
    </Link>)}
  </div>;
}
