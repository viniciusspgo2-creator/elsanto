import type { Metadata,Viewport } from 'next';
import './globals.css';
import './premium.css';
import './v7-refinements.css';
import { ClientShell } from '@/components/ClientShell';
import { getSettings } from '@/lib/catalog';

const baseUrl=process.env.NEXT_PUBLIC_APP_URL|| (process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'http://localhost:3000');
const description='Restaurante mexicano em São José do Rio Preto com tacos, burritos, quesadillas, birria, chimichangas, chicharrón com guacamole e sobremesas. Salão, retirada e delivery.';
export const metadata:Metadata={
  metadataBase:new URL(baseUrl),
  title:{default:'El Santo Cocina Mexicana | Tacos, Birria e Drinks em Rio Preto',template:'%s | El Santo'},
  description,
  applicationName:'El Santo Cocina Mexicana',
  keywords:['restaurante mexicano','São José do Rio Preto','tacos','birria','burrito','quesadilla','nachos','guacamole','delivery mexicana','El Santo'],
  authors:[{name:'El Santo Cocina Mexicana'}],
  creator:'El Santo Cocina Mexicana',
  publisher:'El Santo Cocina Mexicana',
  formatDetection:{telephone:true,address:true},
  alternates:{canonical:'/'},
  icons:{icon:[{url:'/favicon.ico'},{url:'/favicon-32.png',sizes:'32x32',type:'image/png'},{url:'/icons/icon-192.png',sizes:'192x192',type:'image/png'}],apple:'/apple-touch-icon.png'},
  manifest:'/manifest.webmanifest',
  openGraph:{type:'website',locale:'pt_BR',url:'/',siteName:'El Santo Cocina Mexicana',title:'EL SANTO — Cocina • Fuego • Tradición',description,'images':[{url:'/og-el-santo.png',width:1200,height:630,alt:'Logotipo El Santo Cocina Mexicana'}]},
  twitter:{card:'summary_large_image',title:'EL SANTO — Cocina • Fuego • Tradición',description,images:['/og-el-santo.png']}
};
export const viewport:Viewport={themeColor:'#bd2621',width:'device-width',initialScale:1,maximumScale:5};
const jsonLd={'@context':'https://schema.org','@type':'Restaurant',name:'El Santo Cocina Mexicana',servesCuisine:['Mexicana','Tex-Mex'],priceRange:'$$',telephone:'+55 17 99643-7365',url:baseUrl,image:[`${baseUrl}/og-el-santo.png`],address:{'@type':'PostalAddress',streetAddress:'R. Saldanha Marinho, 4011',addressLocality:'São José do Rio Preto',addressRegion:'SP',addressCountry:'BR'},sameAs:['https://www.instagram.com/elsantorp/'],acceptsReservations:'True',menu:`${baseUrl}/cardapio`};
export default async function RootLayout({children}:{children:React.ReactNode}){const settings=await getSettings();return <html lang="pt-BR"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><ClientShell settings={{whatsapp:settings.whatsapp,announcement:settings.announcement,promoEnabled:settings.promoEnabled,promoImageUrl:settings.promoImageUrl,promoTitle:settings.promoTitle,restaurantOpenOverride:settings.restaurantOpenOverride}}>{children}</ClientShell></body></html>}
