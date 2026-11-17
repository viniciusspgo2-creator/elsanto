import {AdminShell} from '@/components/AdminShell';
import {GalleryAdmin} from '@/components/ContentCMS';
export const dynamic='force-dynamic';
export default function GalleryPage(){return <AdminShell title="Galeria de fotos" allowed={['ADMIN','MANAGER']}><GalleryAdmin/></AdminShell>}
