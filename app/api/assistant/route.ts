import {NextResponse} from 'next/server';
import {checkLimit,sourceIp} from '@/lib/request-limiter';
import {getPublicMenu,getSettings} from '@/lib/catalog';
import type {PublicItem} from '@/lib/menu';
import {currency} from '@/lib/format';

/**
 * Assistente EL SANTO — 100% mecânico, sem IA.
 * Motor de intenções com sinônimos, busca com pontuação no catálogo real,
 * recomendações, informações da casa e sugestões de próximas perguntas.
 */
type Answer={reply:string;items?:{name:string;priceCents:number|null;imageUrl:string;category:string}[];suggestions?:string[]};

const ADDRESS='R. Saldanha Marinho, 4011 — Vila Santo Antônio, São José do Rio Preto/SP';
const WHATS='(17) 99643-7365';

function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim()}
const has=(s:string,...words:string[])=>words.some(w=>s.includes(w));

const SYNONYMS:{match:string[];terms:string[];label?:string}[]=[
 {match:['picante','apimentad','pimenta','fogo','ardid'],terms:['picante','pimenta','jalapen','chipotle','fuego'],label:'Picantes'},
 {match:['frango','galinha','poulet'],terms:['frango'],label:'Frango'},
 {match:['carne','bovino','boi','patinho','acem'],terms:['bovino','carne'],label:'Bovinos'},
 {match:['porco','suino','costela','belly','chicharron','torresmo'],terms:['porco','suína','barriga','costela','chicharrón'],label:'Suínos'},
 {match:['peixe','camarao','mar','frutos','seafood','pescado'],terms:['peixe','camarão','mar'],label:'Frutos do mar'},
 {match:['queijo','queso','cheddar','derretid'],terms:['queijo','queijos'],label:'Com queijo'},
 {match:['vegetariano','vegetariana','sem carne','veggie','vegetal'],terms:['vegetariano','alface','abacate','guacamole','milho','queijos'],label:'Leves e vegetarianas'},
 {match:['doce','sobremesa','sobremesas','postre','acucar','gelado','sorvete'],terms:['doce','sorvete','chocolate','banana','canela'],label:'Sobremesas'},
 {match:['compartilhar','grupo','familia','amigos','porcao','porções','dividir','casal','festa'],terms:['compartilhar','porção','porções'],label:'Para compartilhar'},
 {match:['crianca','criancas','kids','milho','suave','leve'],terms:['milho','leve','suave'],label:'Opções suaves'},
 {match:['sopa','caldo','consome','consomme'],terms:['caldo'],label:'Caldos'},
 {match:['barato','economic','em conta','promo','menor preco'],terms:[],label:'Econômicos'},
 {match:['caro','premium','especial','top'],terms:[],label:'Especiais'},
];

function score(item:PublicItem,terms:string[],s:string){
  let n=0;const name=normalize(item.name),desc=normalize(item.description),cat=normalize(item.category);
  for(const t of terms){
    if(name.includes(t))n+=3;
    if(desc.includes(t))n+=1;
    if(cat.includes(t))n+=2;
  }
  if(has(s,'picante','apimentad','pimenta','ardid')&&item.heat>0)n+=3;
  if(has(s,'picante','apimentad')&&item.heat>=2)n+=2;
  if(has(s,'barato','economic','em conta','promo')&&item.priceCents!==null&&item.priceCents<=2000)n+=4;
  if(has(s,'caro','premium','especial','top')&&item.priceCents!==null&&item.priceCents>=5000)n+=3;
  if(has(s,'compartilhar','grupo','familia','porcao','dividir','festa')&&/compartilhar|porção|porções/i.test(item.description))n+=3;
  if(has(s,'vegetariano','vegetariana','sem carne','veggie')&&!/bovino|porco|camarão|peixe|frango|carne/i.test(item.name+' '+item.description)&&item.category!=='Tacos tradicionales')n+=2;
  return n;
}

function cards(items:PublicItem[],max=4){return items.slice(0,max).map(x=>({name:x.name,priceCents:x.priceCents,imageUrl:x.imageUrl,category:x.category}))}

function mechanical(text:string,items:PublicItem[]):Answer{
  const s=normalize(text);
  const featured=items.filter(x=>x.featured);

  // Saudações e conversa
  if(/^(oi|ola|hello|hey|buenos|bom dia|boa tarde|boa noite|e ai|opah|hola)\b/.test(s))
   return {reply:'¡Hola! Bem-vindo ao El Santo Cocina Mexicana. Posso indicar pratos, bebidas, valores, nosso endereço e como pedir. O que você procura?',suggestions:['O que é mais pedido?','Quero um taco picante','Bebidas e drinks','Como faço meu pedido?']};
  if(has(s,'obrigad','valeu','vlw','gracias','muito bom','top demais'))
   return {reply:'¡De nada! Qualquer coisa estou por aqui. Prove, volte e traga mais gente: quem prova, sempre volta.',suggestions:['Ver cardápio','Combos para compartilhar']};
  if(has(s,'tchau','adeus','ate mais','flw','encerrar'))
   return {reply:'Hasta luego! Esperamos você na R. Saldanha Marinho, 4011. Buen provecho!'};

  // Informações da casa
  if(has(s,'endereco','onde fica','voces ficam','onde ficam','localizacao','chegar','fica onde','rua','sao jose'))
   return {reply:`Estamos na ${ADDRESS}. Temos estacionamento próprio para clientes. Veja o mapa na página de contato (/contato) ou chame no WhatsApp ${WHATS}.`,suggestions:['Horário de funcionamento','Como faço meu pedido?']};
  if(has(s,'horario','aberto','fecha','funcionamento','abre','que horas'))
   return {reply:'O horário pode variar em dias especiais. Confira os horários atualizados no nosso perfil do Google e no Instagram @elsantorp, ou fale com a equipe pelo WhatsApp '+WHATS+'.',suggestions:['Qual o endereço?','Cardápio de tacos']};
  if(has(s,'whatsapp','atendente','humano','pessoa real','falar com alguem','telefone'))
   return {reply:`Você pode falar com a equipe pelo WhatsApp ${WHATS} — atendemos para tirar dúvidas, registrar pedidos e ajudar no salão.`,suggestions:['Como acompanho meu pedido?']};
  if(has(s,'delivery','entrega','entregam','frete','taxa de entrega','levam'))
   return {reply:'Fazemos delivery com taxa calculada pelo bairro no checkout (sem valor inventado — o sistema mostra a taxa real antes de confirmar). Também atendemos retirada no balcão e consumo no salão.',items:cards(featured,3),suggestions:['Qual o endereço?','Combos para compartilhar']};
  if(has(s,'retirada','buscar','take away','takeaway','balcao'))
   return {reply:'Para retirada, finalize o pedido escolhendo "Retirada" no checkout e busque na '+ADDRESS+'. A avisamos quando estiver pronto pelo link de acompanhamento.',suggestions:['Como acompanho meu pedido?','O que é mais pedido?']};
  if(has(s,'acompanhar','rastrear','onde esta meu pedido','status do pedido','meu pedido'))
   return {reply:'Todo pedido gera um link privado de acompanhamento: /pedido. Salve o link do seu pedido para ver o status em tempo real (preparo, saída para entrega e conclusão).',suggestions:['Como faço meu pedido?']};
  if(has(s,'pagamento','pagar','pix','cartao','dinheiro','credito','debito'))
   return {reply:'Aceitamos Pix, cartão de crédito e débito, e dinheiro. A confirmação do pagamento é feita pela nossa equipe — no site não há cobrança online nesta etapa. Na mesa, pague no caixa ou com o atendente.',suggestions:['Como faço meu pedido?','Formas de receber o pedido']};
  if(has(s,'mesa','qr code','qrcode','salao','consumir no local'))
   return {reply:'No salão, escaneie o QR Code da sua mesa: abre o cardápio já identificado com a mesa — sem informar endereço nem telefone. O pedido vai direto para a cozinha e o pagamento fica para o final, no caixa ou com o atendente.',suggestions:['Cardápio de tacos','Bebidas e drinks']};
  if(has(s,'promo','promocao','cupom','desconto','combo'))
   {const combos=items.filter(x=>/combo/i.test(x.name));return {reply:'Temos os Combos I e II (para uma pessoa ou compartilhar) e o Combo Casal — montados com burrito, nacho, quesadilla e cantarito. É só escolher no cardápio em /cardapio.',items:cards(combos.length?combos:featured,3),suggestions:['O que é mais pedido?','Sobremesas']};}
  if(has(s,'reserva','reservar','aniversario','evento','data comemorativa'))
   return {reply:`Fazemos reservas e eventos — fale com a equipe pelo WhatsApp ${WHATS} que organizamos a sua experiência com fogo, sabor e música.`};

  // Bebidas
  if(has(s,'bebida','beber','gelo','drink','drinks','coquetel','margarita','michelada','cantarito','cerveja','refrigerante','suco','agua','whisky','whiskey','doses','tequila','mezcal','alcool','cacha'))
   {const drinkCats=['Drinks','Cervejas','Refrigerantes','Sucos','Whisky & Doses','Bebidas'];
    const found=items.filter(x=>drinkCats.some(c=>x.category===c));
    const noAlcohol=has(s,'sem alcool','sem alcoolico','refri','refrigerante','suco','agua','nao alcoolica','para crianca');
    const list=noAlcohol?items.filter(x=>/Refrigerantes|Sucos|Bebidas/.test(x.category)):found;
    if(!list.length)return {reply:'As bebidas ainda estão sendo cadastradas no painel pela equipe — os valores oficiais serão publicados em breve. Enquanto isso, consulte opções e preços pelo WhatsApp '+WHATS+'.',items:[],suggestions:['O que é mais pedido?','Sobremesas']};
    return {reply:noAlcohol?'Temos refrigerantes, sucos e opções sem álcool no cardápio.':'Trabalhamos com drinks autorais, cervejas, refrigerantes, sucos e doses — consulte os valores atuais no cardápio em /cardapio (categoria Bebidas). Se quiser, peça uma michelada para acompanhar os tacos!',items:cards(list,4),suggestions:['Drinks com tequila?','Sobremesas','Cardápio de tacos']};}

  // Sobremesas
  if(has(s,'sobremesa','doce','postre','sorvete','chimi churro','chimichanga doce'))
   {const postres=items.filter(x=>x.category==='Postres');return {reply:'Para fechar com chave de ouro: chimichanga doce de doce de leite com banana, helado artesanal da casa e bolo gelado de chocolate com toque de tequila.',items:cards(postres,3),suggestions:['Combos','Bebidas e drinks']};}

  // Intenções de categoria explícita (têm prioridade sobre a busca genérica)
  if(has(s,'taco','tacos')){const spicy=has(s,'picante','apimentad','pimenta','ardid');let tacos=items.filter(x=>x.category.startsWith('Tacos'));if(spicy)tacos=[...tacos].sort((a,b)=>b.heat-a.heat);else tacos=[...tacos.filter(x=>x.featured),...tacos.filter(x=>!x.featured)];return {reply:spicy?'Para os fãs de fogo, estes são os tacos mais picantes do cardápio (ordenei pela picância).':'Nossos tacos são divididos em Tradicionales (cochinita, costeño, birria e campechano) e Crunchy (crocantes com frango, peito bovino ou copa lombo). A birria é o mais pedido!',items:cards(tacos,4),suggestions:['Adicionais e removimentos','Bebidas e drinks']};}
  if(has(s,'burrito')){const b=items.filter(x=>/burrito/i.test(x.name)&&x.category!=='Postres');return {reply:'Do comal saem o Burrito clássico e o Burrito compuesto — ambos com frijoles, queijos e guacamole, e a proteína que você escolher (frango, copa lombo, peito bovino ou vegetariano).',items:cards(b,3),suggestions:['Quesadillas','Bebidas e drinks']};}
  if(has(s,'quesadilla')){const q=items.filter(x=>/quesadilla/i.test(x.name));return {reply:'A Quesadilla clássica é tortilla tostada na chapa com mix de queijos derretidos — escolha a proteína e os adicionais no cardápio.',items:cards(q,2),suggestions:['Burritos','Salsas e extras']};}
  if(has(s,'nachos','totopos')){const n=items.filter(x=>/nachos|totopos|vidal/i.test(x.name));return {reply:'Para começar: Nachos Bravos, o lendário Nacho Vidal (para compartilhar), Vidalito (meia porção) e totopos com guacamole e sour cream.',items:cards(n,4),suggestions:['Para compartilhar','Sobremesas']};}
  if(has(s,'salada','saladita','guadalupe','leve')){const e=items.filter(x=>x.category==='Ensaladas');return {reply:'Nossas ensaladas: Saladita del Jefe (frango defumado, bacon, queijos) e Guadalupe (peito bovino, guacamole, pico de gallo).',items:cards(e,2),suggestions:['Sobremesas','Bebidas sem álcool']};}

  // Busca no catálogo (interpretação por palavras + sinônimos)
  const stop=new Set(['quero','queria','gostaria','qual','quais','como','onde','quanto','custa','preco','valor','tem','vcs','voce','voces','por','favor','mais','menos','melhor','bom','otima','otimo','o','a','os','as','de','da','do','um','uma','uns','umas','pra','para','e','no','na','em','com','sem','que','es','eu','meu','minha','eh','sera','top','dica','indica','recomenda']);
  const rawTerms=s.split(' ').filter(t=>t.length>=3&&!stop.has(t));
  const terms=[...rawTerms];
  for(const syn of SYNONYMS)if(syn.match.some(m=>s.includes(m)))terms.push(...syn.terms);
  const scored=terms.length?items.map(item=>({item,s:score(item,terms,s)})).sort((a,b)=>b.s-a.s):[];
  if(scored.length&&scored[0].s>=2){
    const top=scored.filter(x=>x.s>=scored[0].s-1).slice(0,4).map(x=>x.item);
    const pricePart=top[0].priceCents!==null?` O valor registrado é ${currency(top[0].priceCents)}.`:'';
    return {reply:`Encontrei no nosso cardápio: ${top.map(x=>x.name).join(' · ')}.${pricePart} Toque em um item no /cardapio para personalizar adicionais e remover ingredientes.`,items:cards(top,4),suggestions:['Adicionais e removimentos','Como faço meu pedido?','O que é mais pedido?']};
  }
  if(has(s,'adicional','adicionar','extra','remover','tirar','sem cebola','sem coentro','mudar ingrediente'))
   return {reply:'Todo prato tem personalização no cardápio: adicionais (guacamole, sour cream, salsas da casa e caldo rico — R$ 7,90 cada) e a opção "Remover ingredientes" (sem cebola, sem coentro, sem pimenta…). A cozinha recebe exatamente suas escolhas.',suggestions:['Cardápio de tacos','Como faço meu pedido?']};
  if(has(s,'pedido','pedir','como faco','como pedir','fazer pedido','pedir online'))
   return {reply:'Pedir é simples: 1) Abra /cardapio; 2) toque no prato para personalizar; 3) adicione ao pedido e continue escolhendo; 4) no carrinho, escolha delivery, retirada ou mesa; 5) acompanhe tudo pelo link privado em /pedido.',suggestions:['Qual a taxa de entrega?','Combos','O que é mais pedido?']};
  if(has(s,'mais pedido','mais vendido','destaque','recomenda','melhor prato','sugestao','popular','famoso'))
   return {reply:'Os favoritos da casa: Birria (tacos dourados com caldo para mergulhar), La Costelita (costela suína com papas rústicas), Pork Belly e o Nacho Vidal para dividir.',items:cards(featured,4),suggestions:['Cardápio de tacos','Sobremesas','Bebidas e drinks']};
  if(has(s,'ajuda','menu','opcoes','pode fazer o que','o que voce faz'))
   return {reply:'Posso ajudar com: pratos e valores do cardápio, adicionais e removimentos, bebidas, sobremesas, combos, endereço, horários, formas de pagamento, delivery/retirada/mesa e acompanhamento de pedidos. Sobre o que você quer saber?',suggestions:['O que é mais pedido?','Como faço meu pedido?','Qual o endereço?']};

  return {reply:'Não achei isso com precisão no cardápio, mas posso te ajudar com pratos, bebidas, valores, endereço ou como pedir. Se preferir, fale com a equipe pelo WhatsApp '+WHATS+'.',suggestions:['O que é mais pedido?','Como faço meu pedido?','Qual o endereço?']};
}

export async function POST(req:Request){
  const limit=checkLimit('assistant',sourceIp(req),20,60_000);
  if(!limit.allowed)return NextResponse.json({reply:'Muitas mensagens em sequência. Tente novamente em instantes.'},{status:429,headers:{'Retry-After':String(limit.retryAfter)}});
  try{
    const input=await req.json();
    const message=typeof input.message==='string'?input.message.trim().slice(0,600):'';
    if(!message)return NextResponse.json({reply:'Olá! Pode me contar como posso ajudar?'});
    const [items,settings]=await Promise.all([getPublicMenu(),getSettings()]);
    const answer=mechanical(message,items);
    return NextResponse.json({...answer,mode:'mechanical',aiEnabled:false});
  }catch{
    return NextResponse.json({reply:'Não consegui processar sua mensagem. Fale com a equipe pelo WhatsApp (17) 99643-7365.'});
  }
}
