import type { Metadata } from 'next';
import {MenuGrid} from '@/components/MenuGrid';
import {PrintedMenu} from '@/components/PrintedMenu';
import {getPublicMenu} from '@/lib/catalog';
import {db,databaseConfigured} from '@/lib/db';
import {ChefHat,Flame,Armchair} from 'lucide-react';
export const metadata:Metadata={title:'Cardápio'};
export const dynamic='force-dynamic';
export default async function Cardapio({searchParams}:{searchParams:Promise<{mesa?:string;modo?:string}>}){
  const {mesa}=await searchParams;
  const items=await getPublicMenu();
  let tableName='';
  if(mesa&&databaseConfigured()&&/^[A-Za-z0-9_-]{8,64}$/.test(mesa)){try{const t=await db.restaurantTable.findFirst({where:{shortToken:mesa,active:true},select:{name:true}});tableName=t?.name||''}catch{tableName=''}}
  return <main className="menu-page">{tableName&&<section className="table-banner" aria-label={`Mesa identificada: ${tableName}`}><span className="table-banner-icon"><Armchair size={19}/></span><div><strong>{tableName} · consumo no local</strong><small>Este pedido já vai identificado para a cozinha. Sem endereço, sem cadastro — o pagamento fica para o final, no caixa ou com o atendente.</small></div><span className="table-ok">QR válido</span></section>}
  <section className="page-hero menu-page-hero"><div className="container"><span className="overline">EL SANTO · MENU</span><h1>ESCOLHA SEU<br/><em>PRÓXIMO FAVORITO.</em></h1><p>Seu encontro com o México começa por aqui. Explore sabores, personalize o pedido e aproveite cada momento.</p></div></section><section className="section menu-products"><div className="container"><div className="menu-intro"><div><span className="overline dark">NOSSA COCINA</span><h2>FEITO COM <em>ALMA.</em></h2></div><span className="menu-intro-aside"><Flame size={21}/> Os sabores do El Santo em uma experiência só.</span></div><MenuGrid items={items}/><div className="menu-disclaimer">* Produtos e valores exibidos de acordo com o cadastro atual. Preços extraídos do cardápio impresso fornecido pelo restaurante. Imagens dos pratos são ilustrativas; sem banco de dados configurado, o cardápio é apenas para consulta e não recebe pedidos.</div></div></section><PrintedMenu/></main>}
