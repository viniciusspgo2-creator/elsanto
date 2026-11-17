/** Data de referência comercial: o dia do restaurante não é o dia UTC da Vercel. */
const ZONE='America/Sao_Paulo';
const formatter=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function parts(date:Date){const p=Object.fromEntries(formatter.formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));return {year:p.year,month:p.month,day:p.day,hour:p.hour,minute:p.minute,second:p.second};}
function offsetMinutes(date:Date){const p=parts(date);return Math.round((Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-date.getTime())/60000);}
function localMidnightUTC(y:number,m:number,d:number){let time=Date.UTC(y,m-1,d);for(let i=0;i<3;i++)time=Date.UTC(y,m-1,d)-offsetMinutes(new Date(time))*60_000;return new Date(time);}
export function restaurantPeriodStarts(now=new Date()){
 const p=parts(now);
 return {day:localMidnightUTC(p.year,p.month,p.day),month:localMidnightUTC(p.year,p.month,1)};
}
