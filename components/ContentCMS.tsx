'use client';
import {useCallback,useEffect,useState} from 'react';
import Image from 'next/image';
import {ImagePlus,Image as ImageIcon,Newspaper,Plus,RefreshCw,Save,Trash2,UploadCloud,ExternalLink,X,Eye} from 'lucide-react';
import {UploadButton} from './UploadButton';

type Gallery={id:string;imageUrl:string;alt:string;caption:string|null;sort:number;published:boolean};
type Blog={id:string;title:string;slug:string;excerpt:string;content:string;imageUrl:string|null;published:boolean;publishedAt:string|null};
const emptyGallery:Omit<Gallery,'id'>={imageUrl:'',alt:'',caption:'',sort:0,published:false};
const emptyBlog:Omit<Blog,'id'|'publishedAt'>={title:'',slug:'',excerpt:'',content:'',imageUrl:'',published:false};
async function call<T>(path:string,method='GET',body?:unknown):Promise<T>{const response=await fetch(path,{method,headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,cache:'no-store'});const value=await response.json();if(!response.ok)throw Error(value.error||'Não foi possível salvar');return value as T}

/** Entrada de imagem com UPLOAD otimizado (WebP automático) e opção de URL externa. */
function ImageInput({value,onChange}:{value:string;onChange:(v:string)=>void}){
 const [error,setError]=useState('');
 return <div className="cms-image-input">
  <UploadButton onUploaded={url=>{setError('');onChange(url)}}/>
  <label className="admin-label">Ou cole uma URL de imagem (HTTPS ou /images/...)<input type="url" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="https://.../imagem.webp"/></label>
  {error&&<p className="admin-toast error">{error}</p>}
  {value&&<div className="cms-image-preview"><img src={value} alt="Prévia da imagem escolhida" loading="lazy"/></div>}
 </div>;
}
export function GalleryAdmin(){
 const [images,setImages]=useState<Gallery[]>([]),[draft,setDraft]=useState<Partial<Gallery>>(emptyGallery),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[preview,setPreview]=useState<Gallery|null>(null);
 const refresh=useCallback(async()=>{try{const res=await call<{images:Gallery[]}>('/api/admin/gallery');setImages(res.images)}catch(e){setMessage(e instanceof Error?e.message:'Erro ao carregar')}},[]);
 useEffect(()=>{void refresh()},[refresh]);
 async function save(){if(!draft.imageUrl?.trim()||!draft.alt?.trim()){setMessage('Envie a imagem e preencha a descrição alternativa (acessibilidade).');return}setBusy(true);try{await call('/api/admin/gallery',draft.id?'PATCH':'POST',draft);setDraft(emptyGallery);setMessage('Imagem salva com sucesso.');await refresh()}catch(e){setMessage(e instanceof Error?e.message:'Falha ao salvar')}finally{setBusy(false)}}
 async function remove(id:string){if(!window.confirm('Excluir esta imagem da galeria?'))return;setBusy(true);try{await call('/api/admin/gallery','DELETE',{id});setPreview(null);setMessage('Imagem removida.');await refresh()}catch(e){setMessage(e instanceof Error?e.message:'Falha ao excluir')}finally{setBusy(false)}}
 const publishedCount=images.filter(x=>x.published).length;
 return <div className="cms-admin">
  <div className="admin-panel-head"><div><h2>Galeria oficial do El Santo</h2><p>{images.length} imagens · {publishedCount} publicadas · aparecem na página inicial e alimentam a home.</p></div><button className="admin-btn" onClick={()=>void refresh()}><RefreshCw size={17}/> Atualizar</button></div>
  {message&&<p role="status" className="admin-toast">{message}</p>}
  <section className="admin-card cms-editor"><div className="admin-panel-head"><h3>{draft.id?'Editar fotografia':'Nova fotografia'}</h3>{draft.id&&<button className="admin-btn" onClick={()=>setDraft(emptyGallery)}><Plus size={16}/> Nova</button>}</div>
   <ImageInput value={draft.imageUrl||''} onChange={imageUrl=>setDraft(v=>({...v,imageUrl}))}/>
   <div className="admin-form-grid">
    <label className="admin-label full">Descrição alternativa (acessibilidade)<input maxLength={200} value={draft.alt||''} onChange={e=>setDraft(v=>({...v,alt:e.target.value}))} placeholder="Ex.: Salão do El Santo à noite com luzes quentes"/></label>
    <label className="admin-label">Legenda<input maxLength={140} value={draft.caption||''} onChange={e=>setDraft(v=>({...v,caption:e.target.value}))} placeholder="Ex.: Noites com sabor de México"/></label>
    <label className="admin-label">Ordem de exibição<input type="number" min={0} max={9999} value={draft.sort||0} onChange={e=>setDraft(v=>({...v,sort:Number(e.target.value)}))}/></label>
    <label className="cms-check"><input type="checkbox" checked={Boolean(draft.published)} onChange={e=>setDraft(v=>({...v,published:e.target.checked}))}/> Publicar na galeria</label>
   </div>
   <button className="admin-btn primary" onClick={()=>void save()} disabled={busy}><Save size={17}/> {busy?'Salvando…':'Salvar imagem'}</button></section>
  <div className="cms-gallery-grid">{images.map(image=><article key={image.id} className={'admin-card cms-gallery-card'+(image.published?'':' is-draft')}>
    <button type="button" className="cms-gallery-open" onClick={()=>setPreview(image)} aria-label={`Ver ${image.caption||image.alt}`}><img src={image.imageUrl} alt={image.alt} loading="lazy"/><span className="cms-gallery-cta"><Eye size={15}/> Ver</span></button>
    <div className="cms-gallery-meta"><strong>{image.caption||image.alt}</strong><small>{image.published?'Publicada':'Rascunho'} · Ordem {image.sort}</small>
    <div className="admin-actions"><button className="admin-btn" onClick={()=>{setDraft(image);window.scrollTo({top:0,behavior:'smooth'})}}>Editar</button><button className="admin-btn" disabled={busy} onClick={()=>void remove(image.id)}><Trash2 size={16}/></button></div></div>
  </article>)}
  {!images.length&&<div className="admin-card cms-empty"><ImageIcon size={30}/><p>Nenhuma foto ainda. Envie a primeira imagem com o botão de upload acima.</p></div>}
  </div>
  {preview&&<div className="modal-backdrop" role="presentation" onClick={()=>setPreview(null)}><div className="lightbox" role="dialog" aria-modal="true" aria-label={preview.caption||preview.alt} onClick={e=>e.stopPropagation()}>
   <button className="modal-close" onClick={()=>setPreview(null)} aria-label="Fechar"><X size={20}/></button>
   <img src={preview.imageUrl} alt={preview.alt}/>
   <div className="lightbox-meta"><strong>{preview.caption||preview.alt}</strong><span>{preview.published?'Publicada':'Rascunho'}</span><button className="admin-btn" disabled={busy} onClick={()=>void remove(preview.id)}><Trash2 size={15}/> Excluir</button></div>
  </div></div>}
 </div>;
}
export function BlogAdmin(){
 const [posts,setPosts]=useState<Blog[]>([]),[draft,setDraft]=useState<Partial<Blog>>(emptyBlog),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const refresh=useCallback(async()=>{try{const res=await call<{posts:Blog[]}>('/api/admin/blog');setPosts(res.posts)}catch(e){setMessage(e instanceof Error?e.message:'Erro ao carregar')}},[]);
 useEffect(()=>{void refresh()},[refresh]);
 async function save(){setBusy(true);try{await call('/api/admin/blog',draft.id?'PATCH':'POST',draft);setDraft(emptyBlog);setMessage('Artigo salvo com sucesso.');await refresh()}catch(e){setMessage(e instanceof Error?e.message:'Falha ao salvar')}finally{setBusy(false)}}
 async function remove(id:string){if(!window.confirm('Excluir definitivamente este artigo?'))return;setBusy(true);try{await call('/api/admin/blog','DELETE',{id});setMessage('Artigo removido.');await refresh()}catch(e){setMessage(e instanceof Error?e.message:'Falha ao excluir')}finally{setBusy(false)}}
 const slugify=(text:string)=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return <div className="cms-admin">
  <div className="admin-panel-head"><div><h2>Blog e conteúdos</h2><p>Publique histórias, experiências e novidades sem editar o código. Textos são exibidos sem HTML inseguro.</p></div><button className="admin-btn" onClick={()=>void refresh()}><RefreshCw size={17}/> Atualizar</button></div>
  {message&&<p role="status" className="admin-toast">{message}</p>}
  <section className="admin-card cms-editor"><div className="admin-panel-head"><h3>{draft.id?'Editar artigo':'Novo artigo'}</h3>{draft.id&&<button className="admin-btn" onClick={()=>setDraft(emptyBlog)}><Plus size={16}/> Novo</button>}</div>
   <div className="admin-form-grid"><label className="admin-label">Título<input maxLength={130} value={draft.title||''} onChange={e=>setDraft(v=>({...v,title:e.target.value,slug:v.id?v.slug:slugify(e.target.value)}))} placeholder="Ex.: Da nossa cocina para sua mesa"/></label><label className="admin-label">Endereço do artigo (slug)<input value={draft.slug||''} onChange={e=>setDraft(v=>({...v,slug:slugify(e.target.value)}))}/></label></div>
   <label className="admin-label">Resumo para SEO e listagem<textarea rows={2} maxLength={300} value={draft.excerpt||''} onChange={e=>setDraft(v=>({...v,excerpt:e.target.value}))}/></label>
   <ImageInput value={draft.imageUrl||''} onChange={imageUrl=>setDraft(v=>({...v,imageUrl}))}/>
   <label className="admin-label">Texto completo<textarea className="cms-body-input" rows={12} value={draft.content||''} onChange={e=>setDraft(v=>({...v,content:e.target.value}))} placeholder="Escreva o conteúdo. Separe parágrafos com uma linha em branco."/></label>
   <label className="cms-check"><input type="checkbox" checked={Boolean(draft.published)} onChange={e=>setDraft(v=>({...v,published:e.target.checked}))}/> Publicar imediatamente</label>
   <button className="admin-btn primary" disabled={busy} onClick={()=>void save()}><Save size={17}/> {busy?'Salvando…':'Salvar artigo'}</button></section>
  <div className="cms-post-list">{posts.map(post=><article key={post.id} className="admin-card cms-post-row"><div><strong>{post.title}</strong><p>{post.excerpt}</p><small>{post.published?'Publicado':'Rascunho'} · /blog/{post.slug}</small></div><div className="admin-actions">{post.published&&<a className="admin-btn" href={'/blog/'+post.slug} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir</a>}<button className="admin-btn" onClick={()=>{setDraft(post);window.scrollTo({top:0,behavior:'smooth'})}}>Editar</button><button className="admin-btn" disabled={busy} onClick={()=>void remove(post.id)}><Trash2 size={16}/></button></div></article>)}
  {!posts.length&&<div className="admin-card cms-empty"><Newspaper size={30}/><p>Nenhum artigo. Crie o primeiro rascunho acima.</p></div>}</div>
 </div>;
}
