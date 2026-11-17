import {randomBytes} from 'node:crypto';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';

const MAX_BYTES=10*1024*1024;
const ACCEPTED=['image/jpeg','image/png','image/webp'];
const MAX_DIMENSION=1600;

export type ProcessedImage={url:string;width:number;height:number;bytes:number;originalBytes:number;converted:boolean};

/**
 * Processa a imagem enviada: gira conforme EXIF, reduz para no máximo 1600px,
 * converte para WebP (qualidade 80) e grava em public/uploads — o original grande é descartado.
 * Se o armazenamento S3/R2 estiver configurado, grava lá via presigned PUT (bytes já otimizados).
 */
export async function sharpProcess(file:File):Promise<ProcessedImage>{
  if(!ACCEPTED.includes(file.type))throw new Error('Formato não permitido. Envie JPG, PNG ou WebP.');
  if(file.size<=0||file.size>MAX_BYTES)throw new Error('Imagem acima do limite de 10 MB.');
  const {default:sharp}=await import('sharp');
  const originalBytes=file.size;
  const buffer=Buffer.from(await file.arrayBuffer());
  let pipeline=sharp(buffer,{failOn:'none'}).rotate();
  const meta=await pipeline.metadata();
  const needsResize=(meta.width||0)>MAX_DIMENSION||(meta.height||0)>MAX_DIMENSION;
  if(needsResize)pipeline=pipeline.resize({width:MAX_DIMENSION,height:MAX_DIMENSION,fit:'inside',withoutEnlargement:true});
  const webp=await pipeline.webp({quality:80,effort:3}).toBuffer({resolveWithObject:true});
  const url=await persist(webp.data);
  return {url,width:webp.info.width,height:webp.info.height,bytes:webp.info.size,originalBytes,converted:true};
}

async function persist(data:Buffer):Promise<string>{
  const s3=(process.env.S3_ENDPOINT&&process.env.S3_ACCESS_KEY_ID&&process.env.S3_SECRET_ACCESS_KEY&&process.env.S3_BUCKET&&process.env.S3_PUBLIC_BASE_URL)?{
    endpoint:process.env.S3_ENDPOINT,access:process.env.S3_ACCESS_KEY_ID,secret:process.env.S3_SECRET_ACCESS_KEY,bucket:process.env.S3_BUCKET,region:process.env.S3_REGION||'auto',publicBase:process.env.S3_PUBLIC_BASE_URL}:null;
  const now=new Date();
  const key=`uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,'0')}/${randomBytes(12).toString('hex')}.webp`;
  if(s3){
    const {presignUpload}=await import('./media');
    const sign=presignUpload({filename:key,mime:'image/webp'});
    const put=await fetch(sign.uploadUrl,{method:'PUT',headers:{'Content-Type':'image/webp'},body:new Uint8Array(data)});
    if(!put.ok)throw new Error('Falha ao gravar no armazenamento externo');
    return sign.publicUrl;
  }
  const dir=path.join(process.cwd(),'public',key.split('/').slice(0,-1).join('/'));
  await mkdir(dir,{recursive:true});
  await writeFile(path.join(process.cwd(),'public',key),data);
  void unlink; // original grande nunca é gravado: só a versão otimizada persiste
  return `/${key}`;
}
