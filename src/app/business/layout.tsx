import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('snapspot_token')?.value;
  const decoded = token ? verifyToken(token) : null;

  let role: Role | null = null;
  if (decoded) {
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });
    role = user?.role ?? null;
  }

  if (role !== Role.BUSINESS_OWNER && role !== Role.ADMIN) {
    redirect('/login?role=owner');
  }

  return <>{children}</>;
}
