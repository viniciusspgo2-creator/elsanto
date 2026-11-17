import { db, databaseConfigured } from './db';
import { PLACEHOLDER_MENU, type PublicItem, isModifierGroup } from './menu';
export async function getPublicMenu(): Promise<PublicItem[]> {
  if (!databaseConfigured()) return PLACEHOLDER_MENU;
  try {
    const items=await db.menuItem.findMany({where:{published:true},include:{category:true},orderBy:[{sort:'asc'},{createdAt:'desc'}]});
    if (!items.length) return PLACEHOLDER_MENU;
    return items.map(item=>({id:item.id,name:item.name,slug:item.slug,description:item.description,category:item.category.name,priceCents:item.priceCents,imageUrl:item.imageUrl||'/images/tacos.jpg',available:item.available&&item.priceCents!==null,featured:item.featured,heat:item.heat,illustrative:!item.imageUrl,modifiers:Array.isArray(item.modifiers)?item.modifiers.filter(isModifierGroup):[]}));
  } catch (err) { console.error('Menu read failed',err);return PLACEHOLDER_MENU; }
}
export async function getSettings() {
  const fallback={restaurantOpenOverride:null as boolean|null,heroTitle:'A tradição tem sabor. O fogo tem nome.',heroDescription:'Um pedaço da cultura mexicana no coração de Rio Preto. Descubra aromas, sabores e momentos que merecem ser vividos.',announcement:'Cocina • Fuego • Tradición',whatsapp:'5517996437365',deliveryFeeCents:0,deliveryPricingMode:'FIXED' as const,deliveryBaseFeeCents:0,deliveryKmRateCents:0,deliveryFreeAboveCents:null as number|null,deliveryMaxKm:null as number|null,restaurantLat:null as number|null,restaurantLng:null as number|null,minOrderCents:0,aiEnabled:false,aiProvider:'mechanical',aiModel:'',promoEnabled:false,promoImageUrl:null as string|null,promoTitle:null as string|null};
  if(!databaseConfigured())return fallback;
  try{return await db.siteConfig.findUnique({where:{id:'main'}})||fallback;}catch{return fallback;}
}
