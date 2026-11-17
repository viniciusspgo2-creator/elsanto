import {AdminShell} from '@/components/AdminShell';
import {KitchenDisplay} from '@/components/KitchenDisplay';
export const dynamic='force-dynamic';
export default function Page(){return <AdminShell title="Cozinha · KDS" allowed={['ADMIN','MANAGER','KITCHEN']}><KitchenDisplay/></AdminShell>}
