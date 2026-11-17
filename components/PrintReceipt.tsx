'use client';
import {useState} from 'react';
import {Printer} from 'lucide-react';
export function PrintReceipt(){const [width,setWidth]=useState<'58'|'80'>('80');return <div className="receipt-actions"><label>Bobina <select value={width} onChange={e=>setWidth(e.target.value as '58'|'80')}><option value="80">80 mm</option><option value="58">58 mm</option></select></label><button onClick={()=>{const el=document.getElementById('receipt-print');el?.classList.toggle('paper-58',width==='58');el?.classList.toggle('paper-80',width==='80');window.print()}}><Printer size={18}/> Imprimir comanda</button></div>}
