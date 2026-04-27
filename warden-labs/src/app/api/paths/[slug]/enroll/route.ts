import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { slug } = await params;

    const path = await prisma.certificationPath.findUnique({
      where: { slug },
    });

    if (!path) {
      return NextResponse.json({ error: 'Path no encontrado' }, { status: 404 });
    }

    const existing = await prisma.userCertPath.findUnique({
      where: { userId_pathId: { userId: session.user.id, pathId: path.id } },
    });

    if (existing) {
      return NextResponse.json({ message: 'Ya estás inscrito en este path' });
    }

    await prisma.userCertPath.create({
      data: { userId: session.user.id, pathId: path.id },
    });

    return NextResponse.json({ message: 'Inscripción exitosa' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error al inscribirse' }, { status: 500 });
  }
}
