import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const os = searchParams.get('os') || '';
    const difficulty = searchParams.get('difficulty') || '';

    const where: Record<string, unknown> = {};
    if (os) where.os = os;
    if (difficulty) where.difficulty = difficulty;

    const count = await prisma.machine.count({ where });
    if (count === 0) {
      return NextResponse.json({ error: 'No hay máquinas disponibles' }, { status: 404 });
    }

    const randomSkip = Math.floor(Math.random() * count);
    const machines = await prisma.machine.findMany({
      where,
      skip: randomSkip,
      take: 1,
    });

    return NextResponse.json(machines[0]);
  } catch {
    return NextResponse.json({ error: 'Error al obtener máquina aleatoria' }, { status: 500 });
  }
}
