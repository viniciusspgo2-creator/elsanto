import {db} from './db';
import {getSettings} from './catalog';
import {applyFreeDelivery,neighborhoodKey,priceByDistance} from './delivery-pricing-core';
export type DeliveryAddress={street:string;number:string;neighborhood:string;city?:string;state?:string;zip?:string;complement?:string};
export type DeliveryQuote={feeCents:number;method:'FIXED'|'NEIGHBORHOOD'|'DISTANCE';distanceKm?:number;rule:string;freeDelivery:boolean;minOrderCents:number};
export class DeliveryPricingError extends Error{constructor(message:string,public code=422){super(message);}}
/** Fonte de verdade: taxa sempre calculada no servidor a partir dos dados do endereço e configurações do lojista. */
export async function quoteDelivery(address:DeliveryAddress,subtotalCents:number):Promise<DeliveryQuote>{
 const settings=await getSettings();
 const baseMin=settings.minOrderCents;
 const mode=settings.deliveryPricingMode||'FIXED';
 let feeCents=settings.deliveryFeeCents,rule='Taxa fixa configurada no restaurante',distanceKm:number|undefined,minOrderCents=baseMin;
 if(mode==='NEIGHBORHOOD'){
   const key=neighborhoodKey(address.neighborhood||'');
   if(!key)throw new DeliveryPricingError('Informe o bairro para calcular o valor da entrega.');
   const zone=await db.deliveryZone.findUnique({where:{neighborhoodKey:key}});
   if(!zone||!zone.active)throw new DeliveryPricingError('Bairro ainda não atendido. Consulte o restaurante antes de confirmar o pedido.');
   feeCents=zone.feeCents;rule=`Entrega para ${zone.name}`;minOrderCents=Math.max(baseMin,zone.minOrderCents);
 }
 if(mode==='DISTANCE'){
   const geocodeBase=process.env.GEOCODER_BASE_URL;
   const routerBase=process.env.ROUTER_BASE_URL;
   if(!geocodeBase||!routerBase||settings.restaurantLat==null||settings.restaurantLng==null)throw new DeliveryPricingError('Cálculo por distância indisponível. Consulte a loja para solicitar entrega.');
   if(!address.street||!address.number||!address.neighborhood)throw new DeliveryPricingError('Informe rua, número e bairro para calcular a entrega.');
   const place=[address.street,address.number,address.neighborhood,address.city||'São José do Rio Preto',address.state||'SP','Brasil'].join(', ');
   let geocoder:URL,router:URL;
   try{geocoder=new URL(geocodeBase);router=new URL(routerBase);}catch{throw new DeliveryPricingError('Serviço de cálculo de entrega mal configurado.');}
   if(geocoder.protocol!=='https:'||router.protocol!=='https:')throw new DeliveryPricingError('Os serviços de distância precisam de HTTPS.');
   geocoder.searchParams.set('q',place);geocoder.searchParams.set('format','json');geocoder.searchParams.set('limit','1');
   const signal=AbortSignal.timeout(4500);
   try{
     const res=await fetch(geocoder,{signal,headers:{'User-Agent':'ElSantoDelivery/1.0 (server integration)','Accept':'application/json'}});
     if(!res.ok)throw new Error('Geocoding indisponível');
     const locations=await res.json() as {lat:string;lon:string;addresstype?:string;type?:string}[];
     const location=locations?.[0],lat=Number(location?.lat),lon=Number(location?.lon);
     if(!location||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Local não identificado');
     // Evitar cobrar por distância obtida do centro do bairro/cidade.
     if(!['house','building','residential','commercial'].includes(location.addresstype||location.type||''))throw new Error('Número do endereço não confirmado');
     const routeUrl=new URL(`${router.pathname.replace(/\/$/,'')}/route/v1/driving/${settings.restaurantLng},${settings.restaurantLat};${lon},${lat}`,router.origin);
     routeUrl.searchParams.set('overview','false');
     const routing=await fetch(routeUrl,{signal:AbortSignal.timeout(4500)});
     if(!routing.ok)throw Error('Rota indisponível');
     const result=await routing.json() as {code?:string;routes?:{distance:number}[]};
     const meters=result.routes?.[0]?.distance;
     if(result.code!=='Ok'||!Number.isFinite(meters)||meters==null||meters<=0)throw Error('Distância inválida');
     distanceKm=meters/1000;
     if(settings.deliveryMaxKm!=null&&distanceKm>settings.deliveryMaxKm)throw new DeliveryPricingError('Endereço fora da área máxima de entrega.');
     feeCents=priceByDistance(settings.deliveryBaseFeeCents,settings.deliveryKmRateCents,distanceKm);
     rule='Taxa calculada pela rota viária até o endereço';
   }catch(e){if(e instanceof DeliveryPricingError)throw e;throw new DeliveryPricingError('Não foi possível validar o endereço e calcular uma rota confiável. Confira o número ou consulte o restaurante.');}
 }
 if(!Number.isSafeInteger(feeCents)||feeCents<0||!Number.isSafeInteger(minOrderCents)||minOrderCents<0)throw new DeliveryPricingError('Configuração de entrega inválida.');
 if(subtotalCents<minOrderCents)throw new DeliveryPricingError(`Pedido mínimo para esta entrega: R$ ${(minOrderCents/100).toFixed(2).replace('.',',')}.`);
 const final=applyFreeDelivery(feeCents,subtotalCents,settings.deliveryFreeAboveCents);
 return {feeCents:final,method:mode,distanceKm:distanceKm!==undefined?Math.round(distanceKm*10)/10:undefined,rule,freeDelivery:final===0&&feeCents>0,minOrderCents};
}
