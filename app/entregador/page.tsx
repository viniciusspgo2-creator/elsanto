import {redirect} from 'next/navigation';
import {requireRole} from '@/lib/security';
import {DriverDashboard} from '@/components/DriverDashboard';
export const dynamic='force-dynamic';
export default async function DriverPage(){const user=await requireRole(['DRIVER']);if(!user)redirect('/entregador/login');return <DriverDashboard name={user.name}/>}
