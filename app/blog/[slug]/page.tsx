import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {db,databaseConfigured} from '@/lib/db';
import {ArrowLeft} from 'lucide-react';
export const dynamic='force-dynamic';
async function getPost(slug:string){if(!databaseConfigured())return null;return db.blogPost.findFirst({where:{slug,published:true}}).catch(()=>null)}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const post=await getPost(slug);return post?{title:post.title,description:post.excerpt,openGraph:{title:post.title,description:post.excerpt,images:post.imageUrl?[post.imageUrl]:undefined}}:{title:'Artigo não encontrado'};}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const post=await getPost(slug);if(!post)notFound();
 return <main><section className="page-hero about-hero"><div className="container"><span className="overline">EL SANTO · BLOG</span><h1 className="cms-article-title">{post.title}</h1><p>{post.excerpt}</p></div></section><article className="container cms-article">{post.imageUrl&&<img className="cms-article-cover" src={post.imageUrl} alt={post.title}/>}<div className="cms-article-text">{post.content.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div><Link href="/blog" className="btn btn-dark"><ArrowLeft size={18}/> Voltar ao blog</Link></article></main>;
}
