import {NextResponse} from 'next/server';
import {requireRole} from '@/lib/security';

type AIModel={id:string;name:string};
async function collectGemini(key:string):Promise<AIModel[]>{
 const models:AIModel[]=[];
 let pageToken:string|undefined;
 let count=0;
 do{
  const url=new URL('https://generativelanguage.googleapis.com/v1beta/models');
  url.searchParams.set('pageSize','100');
  if(pageToken)url.searchParams.set('pageToken',pageToken);
  const response=await fetch(url,{headers:{'x-goog-api-key':key},cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error(`Consulta Gemini falhou (HTTP ${response.status})`);
  const data=await response.json() as {models?:{name:string;displayName?:string;supportedGenerationMethods?:string[]}[];nextPageToken?:string};
  for(const model of data.models??[]){
   const id=model.name.replace(/^models\//,'');
   if(id.startsWith('gemini-')&&model.supportedGenerationMethods?.includes('generateContent'))models.push({id,name:model.displayName||id});
  }
  pageToken=data.nextPageToken;
 }while(pageToken&&++count<10);
 return [...new Map(models.map(x=>[x.id,x])).values()].sort((a,b)=>a.id.localeCompare(b.id));
}
async function collectOpenAI(key:string):Promise<AIModel[]>{
 const response=await fetch('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${key}`},cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error(`Consulta OpenAI falhou (HTTP ${response.status})`);
 const data=await response.json() as {data?:{id:string}[]};
 return (data.data??[]).filter(x=>/^(gpt-|chatgpt-|o[1-9])/.test(x.id)).map(x=>({id:x.id,name:x.id})).sort((a,b)=>a.id.localeCompare(b.id));
}
export async function GET(request:Request){
 if(!await requireRole(['ADMIN','MANAGER']))return NextResponse.json({error:'Sem permissão'},{status:403});
 const provider=new URL(request.url).searchParams.get('provider');
 if(provider!=='gemini'&&provider!=='openai')return NextResponse.json({models:[],warning:'Escolha um provedor de IA.'});
 const key=provider==='gemini'?process.env.GEMINI_API_KEY:process.env.OPENAI_API_KEY;
 if(!key)return NextResponse.json({models:[],warning:'Chave da API não configurada. O bot mecânico permanece disponível.'});
 try{
  const models=provider==='gemini'?await collectGemini(key):await collectOpenAI(key);
  return NextResponse.json({models,warning:models.length?'':'A API não retornou modelos. Você ainda pode inserir um identificador manualmente.'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({models:[],warning:e instanceof Error?e.message:'Não foi possível consultar os modelos.'},{headers:{'Cache-Control':'no-store'}})}
}
