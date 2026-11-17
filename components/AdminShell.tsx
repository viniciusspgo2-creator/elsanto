import {redirect} from 'next/navigation';
import type {UserRole} from '@prisma/client';
import {requireRole} from '@/lib/security';
import {AdminFrame} from './AdminFrame';
export async function AdminShell({children,title,allowed=['ADMIN','MANAGER','CASHIER']}:{children:React.ReactNode;title:string;allowed?:UserRole[]}){const s=await requireRole(allowed);if(!s)redirect('/admin/login');return <AdminFrame title={title} name={s.name} role={s.role}>{children}</AdminFrame>}
