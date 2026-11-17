/** A closed online storefront must never block point-of-sale service at the restaurant. */
export function acceptsOrder(openOverride:boolean|null,source:'WEB'|'TABLE'|'POS'){
  return source==='POS'||openOverride!==false;
}
