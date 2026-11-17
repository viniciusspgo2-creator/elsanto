import {NextResponse} from 'next/server';
import {getSettings} from '@/lib/catalog';
import {databaseConfigured} from '@/lib/db';
export async function GET(){
  // Without configured persistence, we cannot accept real orders, even if marketing pages render.
  const settings=await getSettings();
  const accepting=databaseConfigured()&&settings.restaurantOpenOverride!==false;
  return NextResponse.json({accepting,reason:!databaseConfigured()?'unconfigured':accepting?'open':'paused'},{headers:{'Cache-Control':'no-store'}});
}
