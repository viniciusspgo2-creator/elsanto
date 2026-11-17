import {AdminShell} from '@/components/AdminShell';
import {AdminPanel} from '@/components/AdminPanel';
export const dynamic='force-dynamic';
export default function Page(){return <AdminShell title="Cadastro de clientes" allowed={['ADMIN','MANAGER','CASHIER']}><AdminPanel mode="customers"/></AdminShell>}
