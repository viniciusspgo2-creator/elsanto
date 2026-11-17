import {createHmac,createHash,randomBytes} from 'node:crypto';
/** S3-compatible presigned PUT (Cloudflare R2 / S3). No dependency or server proxy. */
const hex=(s:string)=>createHash('sha256').update(s).digest('hex');
const hmac=(key:Buffer|string,data:string)=>createHmac('sha256',key).update(data).digest();
function esc(s:string){return encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase())}
export type SignMediaInput={filename:string;mime:string};
export function canUpload(mime:string,size:number){return ['image/jpeg','image/png','image/webp'].includes(mime)&&Number.isSafeInteger(size)&&size>0&&size<=8*1024*1024}
export function mediaConfig(){
 const endpoint=process.env.S3_ENDPOINT,access=process.env.S3_ACCESS_KEY_ID,secret=process.env.S3_SECRET_ACCESS_KEY,bucket=process.env.S3_BUCKET,publicBase=process.env.S3_PUBLIC_BASE_URL;
 if(!endpoint||!access||!secret||!bucket||!publicBase)return null;
 const url=new URL(endpoint),base=new URL(publicBase);
 if(url.protocol!=='https:'||base.protocol!=='https:'||url.username||url.password||!/^[-a-z0-9.]+$/i.test(bucket))throw Error('Configuração de armazenamento inválida');
 return {endpoint:url,access,secret,bucket,publicBase:base,region:process.env.S3_REGION||'auto'};
}
export function presignUpload({filename,mime}:SignMediaInput,now=new Date()){
 const config=mediaConfig();if(!config)throw Error('Armazenamento externo não configurado');
 if(!['image/jpeg','image/png','image/webp'].includes(mime))throw Error('Formato não permitido');
 const ext=mime==='image/jpeg'?'jpg':mime==='image/png'?'png':'webp';
 const key=`uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,'0')}/${randomBytes(16).toString('hex')}.${ext}`;
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'').replace('Z','Z');
 const date=stamp.slice(0,8),scope=`${date}/${config.region}/s3/aws4_request`;
 const canonicalPath=`${config.endpoint.pathname.replace(/\/$/,'')}/${esc(config.bucket)}/${key.split('/').map(esc).join('/')}`;
 const url=new URL(config.endpoint.toString());url.pathname=canonicalPath;
 const params={
  'X-Amz-Algorithm':'AWS4-HMAC-SHA256',
  'X-Amz-Credential':`${config.access}/${scope}`,
  'X-Amz-Date':stamp,
  'X-Amz-Expires':'300',
  'X-Amz-SignedHeaders':'host',
 };
 const canonicalQuery=Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([a,b])=>esc(a)+'='+esc(b)).join('&');
 const canonicalRequest=['PUT',canonicalPath,canonicalQuery,`host:${url.host}\n`,'host','UNSIGNED-PAYLOAD'].join('\n');
 const stringToSign=['AWS4-HMAC-SHA256',stamp,scope,hex(canonicalRequest)].join('\n');
 const signKey=hmac(hmac(hmac(hmac(`AWS4${config.secret}`,date),config.region),'s3'),'aws4_request');
 const signature=createHmac('sha256',signKey).update(stringToSign).digest('hex');
 url.search=canonicalQuery+'&X-Amz-Signature='+signature;
 const publicUrl=new URL(config.publicBase.toString().replace(/\/$/,'')+'/'+key);
 return {uploadUrl:url.toString(),publicUrl:publicUrl.toString(),key,expiresIn:300};
}
export function validatedImageUrl(input:string){if(/^\/(?:images|icons)\/[a-z0-9/_-]+\.(?:png|jpe?g|webp)$/i.test(input))return input;const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password||url.hostname==='localhost')throw Error('Imagem deve estar hospedada em HTTPS ou em /images/ ou /icons/');return url.toString();}
