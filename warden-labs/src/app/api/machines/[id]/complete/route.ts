import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id: machineId } = await params;

    const existing = await prisma.userMachine.findUnique({
      where: { userId_machineId: { userId: session.user.id, machineId } },
    });

    if (existing) {
      // Toggle off — uncomplete
      await prisma.userMachine.delete({ where: { id: existing.id } });
      return NextResponse.json({ completed: false });
    }

    // Complete the machine
    await prisma.userMachine.create({
      data: { userId: session.user.id, machineId },
    });

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.userStreak.findUnique({
      where: { userId: session.user.id },
    });

    if (streak) {
      const lastDate = streak.lastActivityDate
        ? new Date(streak.lastActivityDate)
        : null;

      if (lastDate) lastDate.setHours(0, 0, 0, 0);

      const isToday = lastDate && lastDate.getTime() === today.getTime();
      const isYesterday = lastDate && (today.getTime() - lastDate.getTime()) === 86400000;

      if (!isToday) {
        const newStreak = isYesterday ? streak.currentStreak + 1 : 1;
        await prisma.userStreak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActivityDate: new Date(),
            totalDaysActive: streak.totalDaysActive + 1,
          },
        });
      }
    }

    return NextResponse.json({ completed: true });
  } catch {
    return NextResponse.json({ error: 'Error al completar la máquina' }, { status: 500 });
  }
}
