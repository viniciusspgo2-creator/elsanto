import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {db,databaseConfigured} from '@/lib/db';
export const dynamic='force-dynamic';
export const metadata={title:'Histórias & novidades',description:'Novidades, gastronomia e cultura mexicana no El Santo Cocina Mexicana.'};
export default async function BlogPage(){
 const posts=databaseConfigured()?await db.blogPost.findMany({where:{published:true},orderBy:{publishedAt:'desc'},take:30}).catch(()=>[]):[];
 return <main><section className="page-hero about-hero"><div className="container"><span className="overline">EL SANTO · HISTÓRIAS</span><h1>FOGO. SABOR.<br/><em>HISTÓRIAS.</em></h1><p>Um pouco mais sobre nossa cozinha, cultura e novidades.</p></div></section><section className="section container"><div className="cms-public-grid">{posts.map(p=><Link className="cms-public-card" href={'/blog/'+p.slug} key={p.id}>{p.imageUrl&&<img src={p.imageUrl} alt={p.title} loading="lazy"/>}<div><span className="overline dark">NOSSA CASA</span><h2>{p.title}</h2><p>{p.excerpt}</p><span className="text-link">Leia a história <ArrowUpRight size={17}/></span></div></Link>)}{!posts.length&&<div className="cms-empty-public"><h2>Novidades em breve!</h2><p>Enquanto isso, venha descobrir o sabor do El Santo.</p><Link href="/cardapio" className="btn btn-red">Ver cardápio <ArrowUpRight size={16}/></Link></div>}</div></section></main>;
}
