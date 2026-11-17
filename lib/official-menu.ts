/**
 * Catálogo transcrito das duas páginas oficiais do cardápio El Santo recebidas em 14/11/2026.
 * Valores em centavos (BRL). Itens condicionais ou com escolha incompleta ficam em rascunho.
 * Fonte: public/images/cardapio-oficial-1.jpg e cardapio-oficial-2.jpg.
 * Nunca atualize registros já editados no admin automaticamente com este seed.
 */
export type OfficialModifier = {id:string;name:string;required:boolean;min:number;max:number;options:{id:string;name:string;priceCents:number}[]};
export type OfficialMenuItem = {
 slug:string;name:string;description:string;category:string;priceCents:number;
 imageUrl:string;featured?:boolean;heat?:number;published?:boolean;
 modifiers?:OfficialModifier[];reviewNote?:string;
};
export const OFFICIAL_CATEGORIES=[
 ['Tacos tradicionales','tacos-tradicionales'],
 ['Tacos crunchy','tacos-crunchy'],
 ['Del comal','del-comal'],
 ['Especialidades del Santo','especialidades'],
 ['Antojitos','antojitos'],
 ['Guarniciones','guarniciones'],
 ['Ensaladas','ensaladas'],
 ['Postres','postres'],
 ['Combos','combos'],
 ['Salsas y extras','salsas-y-extras'],
 ['Bebidas','bebidas'],
] as const;
const beefChoice:OfficialModifier={id:'proteina',name:'Escolha sua proteína',required:true,min:1,max:1,options:[
 {id:'frango',name:'Frango defumado',priceCents:0},
 {id:'copa-lombo',name:'Copa lombo',priceCents:200},
 {id:'peito-bovino',name:'Peito bovino defumado',priceCents:400},
 {id:'vegetariano',name:'Vegetariano',priceCents:400},
]};
const extraChoice:OfficialModifier={id:'adicionais',name:'Adicionais (valores do cardápio)',required:false,min:0,max:6,options:[
 {id:'add-guacamole',name:'Guacamole',priceCents:790},
 {id:'add-sour-cream',name:'Sour cream',priceCents:790},
 {id:'add-salsa-callejera',name:'Salsa Callejera',priceCents:790},
 {id:'add-salsa-chipotle',name:'Salsa Chipotle',priceCents:790},
 {id:'add-salsa-fuego',name:'Salsa Fuego',priceCents:790},
 {id:'add-caldo-rico',name:'Caldo Rico',priceCents:790},
]};
const removeChoice:OfficialModifier={id:'remover-ingredientes',name:'Remover ingredientes',required:false,min:0,max:4,options:[
 {id:'sem-cebola-roxa',name:'Sem cebola roxa',priceCents:0},
 {id:'sem-coentro',name:'Sem coentro',priceCents:0},
 {id:'sem-salsa',name:'Sem salsa/pico de gallo',priceCents:0},
 {id:'sem-pimenta',name:'Sem pimenta (menos picante)',priceCents:0},
]};
const crunchyRemove:OfficialModifier={id:'remover-ingredientes',name:'Remover ingredientes',required:false,min:0,max:4,options:[
 {id:'sem-sour-cream',name:'Sem sour cream',priceCents:0},
 {id:'sem-guacamole',name:'Sem guacamole',priceCents:0},
 {id:'sem-alface',name:'Sem alface americana',priceCents:0},
 {id:'sem-pimenta',name:'Sem pimenta (menos picante)',priceCents:0},
]};
const taco='/images/tacos.jpg',nachos='/images/nachos.jpg',burrito='/images/burrito.jpg',special='/images/prato-especial.jpg';
export const OFFICIAL_MENU:OfficialMenuItem[]=[
 // PÁGINA 1 (frente do cardápio) — Tacos tradicionales
 {slug:'cochinita',name:'Cochinita',description:'Tacos de porco desfiado de Yucatán, marinados com especiarias, cebola roxa em conserva e coentro; tortillas de trigo macias.',category:'tacos-tradicionales',priceCents:4090,imageUrl:taco,modifiers:[extraChoice,removeChoice]},
 {slug:'costanero',name:'Costañero',description:'Peixe branco empanado e frito, salada de repolho e molho cítrico cremoso em tortilla de trigo.',category:'tacos-tradicionales',priceCents:4290,imageUrl:taco,modifiers:[extraChoice,removeChoice]},
 {slug:'birria',name:'Birria (mais pedido)',description:'Peito bovino defumado e queijo; tacos dourados crocantes servidos com caldo rico para mergulhar.',category:'tacos-tradicionales',priceCents:4290,imageUrl:taco,featured:true,heat:1,modifiers:[extraChoice,removeChoice,{id:'remover-ingredientes',name:'Remover ingredientes',required:false,min:0,max:3,options:[{id:'sem-cebola-roxa',name:'Sem cebola roxa',priceCents:0},{id:'sem-coentro',name:'Sem coentro',priceCents:0},{id:'sem-pimenta',name:'Sem pimenta (menos picante)',priceCents:0}]}]},
 {slug:'campechano',name:'Campechano',description:'Mix de carnes, geralmente bovina e linguiça, com coentro, salsa callejera e chicharrón crocante.',category:'tacos-tradicionales',priceCents:4290,imageUrl:taco,heat:1,modifiers:[extraChoice,removeChoice]},
 // PÁGINA 1 — Tacos crunchy
 {slug:'taco-crunchy-peito-bovino',name:'Taco crunchy — Peito bovino',description:'Tortillas crocantes e douradas com alface americana, mix de queijos, pico de gallo, sour cream, guacamole e peito bovino.',category:'tacos-crunchy',priceCents:4190,imageUrl:taco,modifiers:[extraChoice,crunchyRemove]},
 {slug:'taco-crunchy-frango',name:'Taco crunchy — Frango',description:'Tortillas crocantes com frango, alface americana, mix de queijos, pico de gallo, sour cream e guacamole.',category:'tacos-crunchy',priceCents:3590,imageUrl:taco,modifiers:[extraChoice,crunchyRemove]},
 {slug:'taco-crunchy-copa-lombo',name:'Taco crunchy — Copa lombo',description:'Tortillas crocantes com copa lombo, alface americana, queijos, pico de gallo, sour cream e guacamole.',category:'tacos-crunchy',priceCents:3790,imageUrl:taco,modifiers:[extraChoice,crunchyRemove]},
 // PÁGINA 1 — Del comal (preços por escolha da proteína; revisar se aplicável a todos os pratos)
 {slug:'burrito-classico',name:'Burrito clássico',description:'Tortilla de trigo recheada com frijoles temperados, mix de queijos, alface, pico de gallo e guacamole. Escolha sua proteína.',category:'del-comal',priceCents:4590,imageUrl:burrito,published:false,modifiers:[beefChoice,extraChoice,removeChoice]},
 {slug:'burrito-compuesto',name:'Burrito compuesto',description:'Tortilla de trigo recheada com frijoles temperados, mix de queijos, alface, pico de gallo e guacamole. Escolha sua proteína.',category:'del-comal',priceCents:4590,imageUrl:burrito,published:false,modifiers:[beefChoice,extraChoice,removeChoice]},
 {slug:'quesadilla-classica',name:'Quesadilla clássica',description:'Tortilla tostada na chapa com mix de queijos derretidos e pico de gallo, crocante por fora e cremosa por dentro. Escolha sua proteína.',category:'del-comal',priceCents:4590,imageUrl:burrito,published:false,modifiers:[beefChoice,extraChoice,removeChoice]},
 // PÁGINA 1 — Especialidades
 {slug:'la-costelita',name:'La Costelita',description:'Costela suína defumada, extremamente macia, com barbecue de tamarindo e especiarias. Acompanha papas rústicas.',category:'especialidades',priceCents:5590,imageUrl:special,featured:true},
 {slug:'pork-belly',name:'Pork Belly',description:'Cubos de barriga suína defumados e caramelizados com mole agridoce; servidos com rúcula, cebola roxa, coentro e tomatinhos.',category:'especialidades',priceCents:5490,imageUrl:special,featured:true},
 {slug:'nacho-vidal',name:'Nacho Vidal',description:'Porção para compartilhar de frijoles, pimentões salteados, cheddar cremoso, carne bovina desfiada, queijo gratinado, totopos crocantes, guacamole e sour cream.',category:'especialidades',priceCents:8990,imageUrl:nachos,featured:true},
 {slug:'vidalito-meia-porcao',name:'Vidalito — meia porção',description:'Metade da porção de Nacho Vidal para quem quer provar sem culpa.',category:'especialidades',priceCents:5490,imageUrl:nachos},
 {slug:'chimichangas',name:'Chimichangas',description:'Dupla de mini burritos fritos, recheados com feijão vermelho, peito bovino e mix de queijos, no melhor estilo Tex-Mex.',category:'especialidades',priceCents:4890,imageUrl:burrito},
 // PÁGINA 2 — Antojitos
 {slug:'papas-rusticas',name:'Papas rústicas',description:'Batatas steak fritas, crocantes por fora e macias por dentro, temperadas com rub da casa.',category:'antojitos',priceCents:2890,imageUrl:special},
 {slug:'papas-el-santo',name:'Papas El Santo',description:'Batatas steak cobertas com carne suína desfiada, sour cream e jalapeños, intenso e picante.',category:'antojitos',priceCents:3390,imageUrl:special,heat:2},
 {slug:'nachos-bravos',name:'Nachos Bravos',description:'Totopos crocantes com peito bovino defumado e desfiado, mix de queijos, frijolitos, pico de gallo fresco, sour cream e jalapeños.',category:'antojitos',priceCents:3990,imageUrl:nachos,heat:2},
 {slug:'aguachile',name:'Aguachile',description:'Prato mexicano inspirado no ceviche, com camarões, peixe branco, cebola roxa, pepino e ervas em molho cítrico, refrescante e levemente picante.',category:'antojitos',priceCents:5590,imageUrl:special,heat:1},
 {slug:'chicharron-con-guacamole',name:'Chicharrón con guacamole',description:'Barriga suína frita extremamente crocante (similar ao torresmo), servida com guacamole fresco.',category:'antojitos',priceCents:4490,imageUrl:nachos},
 // PÁGINA 2 — Guarniciones
 {slug:'elote-callejero',name:'Elote Callejero',description:'Milho verde cremoso refogado com manteiga, camarão seco e especiarias.',category:'guarniciones',priceCents:3290,imageUrl:special},
 {slug:'huevos-rancheros',name:'Huevos Rancheros',description:'Ovos sobre molho aromático de tomates assados e caldo rico levemente picante.',category:'guarniciones',priceCents:2290,imageUrl:special,heat:1},
 {slug:'arroz-amarillo',name:'Arroz Amarillo',description:'Arroz aromático temperado com especiarias, leve e cheio de sabor.',category:'guarniciones',priceCents:2290,imageUrl:special},
 {slug:'nachos-totopos',name:'Nachos Totopos',description:'Porção de totopos acompanhados de guacamole e sour cream.',category:'guarniciones',priceCents:2990,imageUrl:nachos},
 // PÁGINA 2 — Ensaladas
 {slug:'saladita-del-jefe',name:'Saladita del Jefe',description:'Alface, repolho roxo, cenoura, mix de queijos, frango defumado, bacon crocante, sour cream e chips de tortilla.',category:'ensaladas',priceCents:3490,imageUrl:special},
 {slug:'guadalupe',name:'Guadalupe',description:'Alface americana, milho verde, feijão verde, guacamole, pico de gallo, cebola roxa e peito bovino desfiado.',category:'ensaladas',priceCents:3490,imageUrl:special},
 // PÁGINA 2 — Postres
 {slug:'chimichanga-doce',name:'Chimichanga doce',description:'Tortilla recheada com doce de leite e banana, frita e finalizada com açúcar, canela e raspas de limão.',category:'postres',priceCents:2290,imageUrl:special},
 {slug:'helado-da-casa',name:'Helado da casa',description:'Sorvete sazonal artesanal (22,90). Sabores do dia consulte com a equipe pelo WhatsApp ou no salão.',category:'postres',priceCents:2290,imageUrl:special,published:false},
 {slug:'bolo-gelado-de-chocolate',name:'Bolo gelado de chocolate',description:'Bolo de chocolate feito com cacau 100%, especiarias e um toque de pimenta. Finalizado com brigadeiro cremoso e tequila.',category:'postres',priceCents:2290,imageUrl:special,heat:1},
 // PÁGINA 2 — Combos
 {slug:'combo-i',name:'Combo I',description:'1 burrito peito, 2 tacos crunchy frango, ½ porção de nachos e 2 tacos cochinita.',category:'combos',priceCents:14990,imageUrl:nachos},
 {slug:'combo-ii',name:'Combo II',description:'1 porção Vidalito, 2 tacos birria, 1 quesadilla tradicional e 1 porção chicharrón.',category:'combos',priceCents:17990,imageUrl:nachos},
 {slug:'combo-casal',name:'Combo Casal',description:'1 burrito, 1 nacho, 1 quesadilla e 1 cantarito. Monte o combo com a ajuda da equipe — opções permitidas informadas no salão ou WhatsApp.',category:'combos',priceCents:15900,imageUrl:nachos,published:false},
 // PÁGINA 2 — Salsas y extras
 {slug:'salsa-callejera',name:'Salsa Callejera',description:'Levemente picante, fresca e equilibrada; ótima para acompanhar qualquer prato.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos,heat:1},
 {slug:'salsa-chipotle',name:'Salsa Chipotle',description:'Defumada e cremosa, picância média e sabor marcante.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos,heat:2},
 {slug:'salsa-fuego',name:'Salsa Fuego',description:'Picante e especiada, de intensidade marcante e final prolongado.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos,heat:3},
 {slug:'sour-cream',name:'Sour cream',description:'Cremoso e suave, perfeito para equilibrar a picância.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos},
 {slug:'guacamole-extra',name:'Guacamole',description:'Abacate fresco temperado com cítricos e ervas, cremoso e refrescante.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos},
 {slug:'caldo-rico-extra',name:'Caldo Rico',description:'Caldo encorpado de carnes e especiarias, servido quente para acompanhar ou mergulhar.',category:'salsas-y-extras',priceCents:790,imageUrl:nachos},
];
