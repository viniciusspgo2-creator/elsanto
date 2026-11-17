/** A failed network response may be retried with the same key, but a changed order must get a fresh one. */
export type PendingCheckout={fingerprint:string;key:string};
export function checkoutKeyForPayload(previous:PendingCheckout|null,payload:unknown,createKey:()=>string):PendingCheckout{
  const fingerprint=JSON.stringify(payload);
  if(previous&&previous.fingerprint===fingerprint)return previous;
  return {fingerprint,key:createKey()};
}
