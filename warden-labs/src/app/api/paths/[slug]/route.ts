import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    const path = await prisma.certificationPath.findUnique({
      where: { slug },
      include: {
        weeks: {
          orderBy: { weekNumber: 'asc' },
          include: {
            machines: {
              orderBy: { orderNum: 'asc' },
              include: {
                machine: {
                  include: session?.user?.id ? {
                    completedBy: {
                      where: { userId: session.user.id },
                      select: { id: true, completedAt: true },
                    },
                  } : undefined,
                },
              },
            },
          },
        },
        ...(session?.user?.id ? {
          userPaths: {
            where: { userId: session.user.id },
          },
        } : {}),
      },
    });

    if (!path) {
      return NextResponse.json({ error: 'Path no encontrado' }, { status: 404 });
    }

    return NextResponse.json(path);
  } catch {
    return NextResponse.json({ error: 'Error al obtener path' }, { status: 500 });
  }
}
