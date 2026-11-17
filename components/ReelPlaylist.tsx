'use client';
import {useCallback,useEffect,useState} from 'react';
import {ChevronLeft,ChevronRight,ExternalLink,Instagram,Play} from 'lucide-react';

type Reel={kind:'reel'|'post';id:string;cover:string;title:string;caption?:string};

/** Playlist de vídeos do Instagram com palco único e navegação sequencial (sem vídeos espalhados). */
const ITEMS:Reel[]=[
 {kind:'post',id:'DY-p29wRkuA',cover:'/images/fotos/thumbs/el-santo-21.webp',title:'A vista por dentro',caption:'Do alto, uma vista incrível. Por dentro, uma experiência ainda melhor. No El Santo, cada detalhe foi pensado para transformar uma refeição em um momento especial. Da cozinha saem sabores autênticos da culinária mexicana, do bar vêm os drinks que completam a experiência, e no salão acontecem os encontros que fazem tudo valer a pena.'},
 {kind:'reel',id:'DYdBr_xR78u',cover:'/images/fotos/thumbs/el-santo-13.webp',title:'Clima do salão'},
 {kind:'reel',id:'DMQygALxtZG',cover:'/images/fotos/thumbs/el-santo-11.webp',title:'Tacos na chapa'},
 {kind:'reel',id:'DcOzg1lR4Ay',cover:'/images/fotos/thumbs/el-santo-23.webp',title:'Caldo rico na concha'},
 {kind:'post',id:'DY5ijqWREKE',cover:'/images/fotos/thumbs/el-santo-08.webp',title:'Um pedacinho do México',caption:'Um pedacinho do México bem aqui esperando por você! No El Santo, cada detalhe é uma experiência: ambiente incrível, sabores marcantes e aquela comida suculenta que conquista já na primeira mordida. Vem viver essa experiência mexicana com a gente! Quem prova, sempre volta.'},
 {kind:'reel',id:'DMiyS1yxdfx',cover:'/images/fotos/thumbs/el-santo-30.webp',title:'Mezcal e fumaça'},
 {kind:'reel',id:'Db1aiBDRTEP',cover:'/images/fotos/thumbs/el-santo-06.webp',title:'Quesabirria na chapa'},
 {kind:'reel',id:'DdPhswVRWPf',cover:'/images/fotos/thumbs/el-santo-24.webp',title:'Michelada artesanal'},
 {kind:'reel',id:'DeKjP_xSM0Y',cover:'/images/fotos/thumbs/el-santo-27.webp',title:'Bar & coquetelaria'},
 {kind:'reel',id:'Dd9qYKpyCyc',cover:'/images/fotos/thumbs/el-santo-12.webp',title:'Cantarito servido'},
 {kind:'reel',id:'DeXhKk3h0yM',cover:'/images/fotos/thumbs/el-santo-05.webp',title:'Taco de peixe crocante'},
 {kind:'reel',id:'DefYgSxxMwO',cover:'/images/fotos/thumbs/el-santo-31.webp',title:'Queso fundido'},
 {kind:'reel',id:'DekpTRGxviY',cover:'/images/fotos/thumbs/el-santo-20.webp',title:'Nachos bravos'},
 {kind:'reel',id:'DZYtKnVRMlX',cover:'/images/fotos/thumbs/el-santo-14.webp',title:'Burrito na mão'},
 {kind:'reel',id:'DZOHY4HRamL',cover:'/images/fotos/thumbs/el-santo-25.webp',title:'Costela + papas'},
 {kind:'reel',id:'DZJCiUQRktp',cover:'/images/fotos/thumbs/el-santo-19.webp',title:'Borbulhas e sabor'},
 {kind:'reel',id:'Dfzjh38O3ee',cover:'/images/fotos/thumbs/el-santo-02.webp',title:'Taco em close'},
 {kind:'post',id:'DaJNpSZRXBJ',cover:'/images/fotos/thumbs/el-santo-28.webp',title:'México, mi amor'},
 {kind:'reel',id:'DfxsPHxRXS5',cover:'/images/fotos/thumbs/el-santo-10.webp',title:'Da cozinha à mesa'},
 {kind:'reel',id:'DeOzJm6R3VI',cover:'/images/fotos/thumbs/el-santo-34.webp',title:'Identidade El Santo'},
 {kind:'reel',id:'DY_GGzmsOYV',cover:'/images/fotos/thumbs/el-santo-07.webp',title:'Noite El Santo'},
];

export function ReelPlaylist(){
 const [index,setIndex]=useState(0);
 const current=ITEMS[index];
 const embed=current.kind==='reel'?`https://www.instagram.com/reel/${current.id}/embed/`:`https://www.instagram.com/p/${current.id}/embed/`;
 const link=current.kind==='reel'?`https://www.instagram.com/reel/${current.id}/`:`https://www.instagram.com/p/${current.id}/`;
 const go=useCallback((delta:number)=>{setIndex(i=>(i+delta+ITEMS.length)%ITEMS.length)},[]);
 useEffect(()=>{
  const onKey=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft')go(-1);if(e.key==='ArrowRight')go(1)};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[go]);
 return <div className="reel-playlist" aria-label="Playlist de vídeos do El Santo no Instagram">
  <div className="reel-stage-wrap">
   <div className="reel-stage">
    <iframe key={current.id} src={embed} title={`${current.title} — vídeo do El Santo no Instagram`} loading="lazy" allowFullScreen frameBorder="0" scrolling="no" referrerPolicy="no-referrer"/>
   </div>
   <div className="reel-side">
    <span className="overline">EL SANTO · NAS REDES</span>
    <h3 className="reel-title">{current.title}</h3>
    {current.caption&&<p className="reel-caption">“{current.caption}”</p>}
    <div className="reel-controls">
     <button className="reel-nav" onClick={()=>go(-1)} aria-label="Vídeo anterior"><ChevronLeft size={20}/></button>
     <span className="reel-counter">{index+1} / {ITEMS.length}</span>
     <button className="reel-nav" onClick={()=>go(1)} aria-label="Próximo vídeo"><ChevronRight size={20}/></button>
    </div>
    <a className="reel-open" href={link} target="_blank" rel="noreferrer"><Instagram size={17}/> Abrir no Instagram <ExternalLink size={15}/></a>
    <small className="reel-hint"><Play size={13}/> Toque no vídeo para iniciar. Use as setas ou as capas abaixo para navegar.</small>
   </div>
  </div>
  <div className="reel-strip" role="listbox" aria-label="Selecionar vídeo da playlist">
   {ITEMS.map((item,i)=><button key={item.id+String(i)} role="option" aria-selected={i===index} className={'reel-thumb'+(i===index?' active':'')} onClick={()=>setIndex(i)} title={item.title}>
     <img src={item.cover} alt="" loading="lazy"/>
     <span>{item.kind==='reel'?'REEL':'POST'} · {i+1}</span>
   </button>)}
  </div>
 </div>;
}
