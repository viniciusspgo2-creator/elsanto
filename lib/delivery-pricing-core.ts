/** Funções puras de precificação para serem testadas mesmo sem banco de dados. */
export function neighborhoodKey(v:string){return v.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function priceByDistance(baseCents:number,perKmCents:number,km:number):number{
 if(!Number.isSafeInteger(baseCents)||!Number.isSafeInteger(perKmCents)||baseCents<0||perKmCents<0||!Number.isFinite(km)||km<0)throw Error('Parâmetros de taxa inválidos');
 return baseCents+Math.ceil(km*perKmCents);
}
export function applyFreeDelivery(feeCents:number,subtotalCents:number,freeAboveCents:number|null|undefined){
 return freeAboveCents!==null&&freeAboveCents!==undefined&&freeAboveCents>0&&subtotalCents>=freeAboveCents?0:feeCents;
}
