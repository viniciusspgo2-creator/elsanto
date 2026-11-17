'use client';
import {useRef,useState} from 'react';
import {ImagePlus,Loader2,Check,Sparkles} from 'lucide-react';

type Result={url:string;width:number;height:number;bytes:number;originalBytes:number};

/**
 * Botão de upload para o painel: envia a imagem, o servidor converte para WebP otimizado
 * (máx. 1600px, qualidade 80) e descarta o original grande. Retorna a URL pronta para uso.
 */
export function UploadButton({onUploaded,compact=false}:{onUploaded:(url:string)=>void;compact?:boolean}){
  const inputRef=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState('');
  async function upload(file?:File){
    if(!file)return;
    setError('');setDone('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){setError('Envie JPG, PNG ou WebP de até 10 MB.');return;}
    setBusy(true);
    try{
      const form=new FormData();form.append('file',file);
      const r=await fetch('/api/admin/upload',{method:'POST',body:form});
      const data=await r.json();
      if(!r.ok)throw new Error(data.error||'Falha no envio');
      onUploaded((data as Result).url);
      const saved=Math.max(0,Math.round((1-(data as Result).bytes/(data as Result).originalBytes)*100));
      setDone(`Otimizada · ${(data as Result).width}×${(data as Result).height}${saved>5?` · ${saved}% mais leve`:''}`);
    }catch(e){setError(e instanceof Error?e.message:'Falha no envio');}
    finally{setBusy(false);if(inputRef.current)inputRef.current.value='';}
  }
  return <div className="upload-widget">
    <label className={'admin-btn '+(compact?'':'primary')}>
      {busy?<Loader2 className="spin" size={17}/>:<ImagePlus size={17}/>}
      {busy?'Otimizando e enviando…':'Fazer upload da foto'}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>void upload(e.target.files?.[0])}/>
    </label>
    {done&&<span className="upload-ok"><Check size={14}/> {done}</span>}
    {error&&<span className="upload-err">{error}</span>}
    <small className="upload-hint"><Sparkles size={13}/> PNG/JPEG grandes são convertidos automaticamente para WebP leve.</small>
  </div>;
}
