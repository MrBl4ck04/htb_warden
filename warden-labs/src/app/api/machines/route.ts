import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const os = searchParams.get('os') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const cert = searchParams.get('cert') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    const session = await auth();

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { techniques: { hasSome: [search] } },
      ];
    }

    if (os) where.os = os;
    if (difficulty) where.difficulty = difficulty;
    if (cert) where.certifications = { has: cert };

    const [machines, total] = await Promise.all([
      prisma.machine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: session?.user?.id ? {
          completedBy: {
            where: { userId: session.user.id },
            select: { id: true, completedAt: true, rating: true },
          },
        } : undefined,
      }),
      prisma.machine.count({ where }),
    ]);

    const completedCount = session?.user?.id
      ? await prisma.userMachine.count({ where: { userId: session.user.id } })
      : 0;

    return NextResponse.json({
      machines,
      total,
      completedCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: 'Error al obtener máquinas' }, { status: 500 });
  }
}
