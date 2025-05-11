// File: src/app/dashboard/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // 1) Grab the cookies store (must be awaited in App Router)
  const cookieStore = await cookies();

  // 2) Pull out our JWT
  const token = cookieStore.get('token')?.value;
  if (!token) {
    // no token → redirect
    redirect('/login');
  }

  // 3) Verify signature & expiration
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // invalid or expired → redirect
    redirect('/login');
  }

  // 4) Authenticated → render client UI
  return <DashboardClient type={jwt.verify(token, process.env.JWT_SECRET).type}  />;
}
