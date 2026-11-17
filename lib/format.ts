export const currency = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const dateBR = (date: string | Date) => new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(date));
export const cleanPhone = (v: string) => v.replace(/\D/g, '');
export const whatsAppLink = (message = '', phone = '5517996437365') => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
export const publicOrderNumber = (n: number) => `ES-${String(n).padStart(5, '0')}`;
export const appUrl = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/,'') || 'http://localhost:3000';
export function mapsUrl(address:string, coords?:{lat:number;lng:number}) { const value=coords ? `${coords.lat},${coords.lng}` : address; return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(value)}&travelmode=driving`; }
export function wazeUrl(address:string, coords?:{lat:number;lng:number}) {return coords ? `https://www.waze.com/ul?ll=${coords.lat}%2C${coords.lng}&navigate=yes` : `https://www.waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;}
export function safeAddressText(a: {street?:string;number?:string;complement?:string;neighborhood?:string;city?:string;state?:string;zip?:string}) { return [a.street, a.number, a.neighborhood, a.city || 'São José do Rio Preto', a.state || 'SP', a.zip, 'Brasil'].filter(Boolean).join(', '); }
