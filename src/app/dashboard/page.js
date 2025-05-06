// src/app/dashboard/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  // 1) Read the JWT from the HttpOnly cookie
  const token = cookies().get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  // 2) Verify its signature & expiry
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    
  } catch {
    redirect('/login');
  }

  // 3) If valid, render the client-side dashboard UI
  return <DashboardClient type={jwt.verify(token, process.env.JWT_SECRET).type}  />;
}
