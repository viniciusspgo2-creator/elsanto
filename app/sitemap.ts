import type {MetadataRoute} from 'next';
import {db,databaseConfigured} from '@/lib/db';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=(process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000').replace(/\/$/,'');
  const statics:MetadataRoute.Sitemap=['','/cardapio','/sobre','/contato','/blog','/pedido'].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===''||path==='/cardapio'?'daily':'weekly',priority:path===''?1:path==='/cardapio'?0.9:0.7}));
  if(databaseConfigured()){try{const posts=await db.blogPost.findMany({where:{published:true},select:{slug:true,updatedAt:true},take:200});return [...statics,...posts.map(p=>({url:`${base}/blog/${p.slug}`,lastModified:p.updatedAt,changeFrequency:'monthly' as const,priority:0.6}))]}catch{}}
  return statics;
}
