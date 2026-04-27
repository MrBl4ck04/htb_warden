import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const machine = await prisma.machine.findUnique({
      where: { id },
      include: session?.user?.id ? {
        completedBy: {
          where: { userId: session.user.id },
          select: { id: true, completedAt: true, rating: true },
        },
      } : undefined,
    });

    if (!machine) {
      return NextResponse.json({ error: 'Máquina no encontrada' }, { status: 404 });
    }

    return NextResponse.json(machine);
  } catch {
    return NextResponse.json({ error: 'Error al obtener la máquina' }, { status: 500 });
  }
}
