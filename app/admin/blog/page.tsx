import {AdminShell} from '@/components/AdminShell';
import {BlogAdmin} from '@/components/ContentCMS';
export const dynamic='force-dynamic';
export default function BlogPage(){return <AdminShell title="Blog e conteúdo" allowed={['ADMIN','MANAGER']}><BlogAdmin/></AdminShell>}
