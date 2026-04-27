import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    const paths = await prisma.certificationPath.findMany({
      orderBy: { name: 'asc' },
      include: {
        weeks: { include: { machines: true } },
        ...(session?.user?.id ? {
          userPaths: {
            where: { userId: session.user.id },
            select: { currentWeek: true, startedAt: true, completedAt: true },
          },
        } : {}),
      },
    });

    return NextResponse.json(paths);
  } catch {
    return NextResponse.json({ error: 'Error al obtener paths' }, { status: 500 });
  }
}
