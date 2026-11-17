import {AdminShell} from '@/components/AdminShell';
import {AdminPanel} from '@/components/AdminPanel';
export const dynamic='force-dynamic';
export default function Page(){return <AdminShell title="Funcionários & acessos" allowed={['ADMIN','MANAGER']}><AdminPanel mode="staff"/></AdminShell>}
