import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import { scryptSync,randomBytes } from 'node:crypto';
import { OFFICIAL_MENU, OFFICIAL_CATEGORIES } from '../lib/official-menu';
const prisma=new PrismaClient();
function hash(p:string){const s=randomBytes(16).toString('hex');return `${s}:${scryptSync(p,s,64).toString('hex')}`;}
async function main(){
  await prisma.siteConfig.upsert({where:{id:'main'},update:{},create:{id:'main'}});
  for(let i=0;i<OFFICIAL_CATEGORIES.length;i++){
    const [name,slug]=OFFICIAL_CATEGORIES[i];
    await prisma.menuCategory.upsert({where:{slug},update:{},create:{name,slug,sort:i}});
  }
  // Idempotência essencial: NUNCA sobrescrever alterações feitas pelo lojista.
  const categories=await prisma.menuCategory.findMany();
  const bySlug=new Map(categories.map(c=>[c.slug,c]));
  let created=0,already=0;
  for(let i=0;i<OFFICIAL_MENU.length;i++){
    const x=OFFICIAL_MENU[i],cat=bySlug.get(x.category);
    if(!cat)throw Error(`Categoria ausente: ${x.category}`);
    const exists=await prisma.menuItem.findUnique({where:{slug:x.slug},select:{id:true}});
    if(exists){already++;continue;}
    await prisma.menuItem.create({data:{categoryId:cat.id,name:x.name,slug:x.slug,description:x.description,imageUrl:x.imageUrl,
      priceCents:x.priceCents,published:x.published!==false,available:true,featured:x.featured??false,heat:x.heat??0,modifiers:(x.modifiers??[]) as unknown as Prisma.InputJsonValue,sort:i}});
    created++;
  }
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
  if(email&&password&&password.length>=12){const existing=await prisma.staffUser.findUnique({where:{email}});if(!existing){await prisma.staffUser.create({data:{email,name:'Admin El Santo',passwordHash:hash(password),role:UserRole.ADMIN}});console.log('Admin criado.');}else console.log('Admin preexistente preservado.');}
  else console.log('Configure ADMIN_EMAIL e ADMIN_PASSWORD (12+ caracteres) para criar um administrador.');
  console.log(`Catálogo oficial: ${created} produtos novos, ${already} existentes preservados. Itens pendentes permanecem em rascunho.`);
}
main().finally(()=>prisma.$disconnect());
