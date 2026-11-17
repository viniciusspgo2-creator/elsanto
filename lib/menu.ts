export type ModifierOption = { id: string; name: string; priceCents: number };
export type ModifierGroup = { id: string; name: string; required: boolean; min: number; max: number; options: ModifierOption[] };
export type PublicItem = { id: string; name: string; slug: string; description: string; category: string; priceCents: number | null; imageUrl: string; available: boolean; featured: boolean; heat: number; modifiers: ModifierGroup[]; illustrative?: boolean };
import {OFFICIAL_MENU, OFFICIAL_CATEGORIES} from './official-menu';
// Catálogo público de demonstração: valores reais do cardápio impresso,
// mas indisponível para pedidos enquanto o banco não estiver configurado.
export const PLACEHOLDER_MENU: PublicItem[] = OFFICIAL_MENU.map(item=>({
  id:'preview-'+item.slug,name:item.name,slug:item.slug,description:item.description,
  category:OFFICIAL_CATEGORIES.find(c=>c[1]===item.category)?.[0]??item.category,
  priceCents:item.priceCents,imageUrl:item.imageUrl,available:false,
  featured:item.featured??false,heat:item.heat??0,modifiers:item.modifiers??[],illustrative:true,
}));
export const categories = ['Todos',...OFFICIAL_CATEGORIES.map(c=>c[0])];
export const isModifierGroup = (v: unknown): v is ModifierGroup => !!v && typeof v==='object' && typeof (v as ModifierGroup).id==='string' && Array.isArray((v as ModifierGroup).options);
