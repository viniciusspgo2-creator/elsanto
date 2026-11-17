import {OrderTracking} from '@/components/OrderTracking';
export const dynamic='force-dynamic';
export default async function PedidoTracking({params}:{params:Promise<{token:string}>}){const {token}=await params;return <main><OrderTracking token={token}/></main>}
