import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      user,
      totalCompleted,
      completedByOS,
      completedByDifficulty,
      streakData,
      activePaths,
      recentActivity,
      allCompletedMachines,
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { username: true, email: true, avatar: true, bio: true, createdAt: true } }),
      prisma.userMachine.count({ where: { userId } }),
      prisma.userMachine.findMany({
        where: { userId },
        include: { machine: { select: { os: true } } },
      }),
      prisma.userMachine.findMany({
        where: { userId },
        include: { machine: { select: { difficulty: true } } },
      }),
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.userCertPath.findMany({
        where: { userId },
        include: { path: { select: { name: true, slug: true, totalWeeks: true, color: true } } },
      }),
      prisma.userMachine.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 30,
        include: { machine: { select: { name: true, os: true, difficulty: true } } },
      }),
      prisma.userMachine.findMany({
        where: { userId },
        include: { machine: { select: { techniques: true } } },
      }),
    ]);

    const totalMachines = await prisma.machine.count();

    // OS breakdown
    const osCounts: Record<string, number> = {};
    completedByOS.forEach(um => {
      const os = um.machine.os;
      osCounts[os] = (osCounts[os] || 0) + 1;
    });

    // Difficulty breakdown
    const diffCounts: Record<string, number> = {};
    completedByDifficulty.forEach(um => {
      const d = um.machine.difficulty;
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    });

    // Top techniques
    const techCounts: Record<string, number> = {};
    allCompletedMachines.forEach(um => {
      um.machine.techniques.forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });
    const topTechniques = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Activity heatmap (last 365 days)
    const heatmap: Record<string, number> = {};
    recentActivity.forEach(um => {
      const dateKey = new Date(um.completedAt).toISOString().split('T')[0];
      heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
    });

    return NextResponse.json({
      user,
      stats: {
        totalCompleted,
        totalMachines,
        completionRate: totalMachines > 0 ? Math.round((totalCompleted / totalMachines) * 100) : 0,
        osCounts,
        diffCounts,
        topTechniques,
        estimatedHours: totalCompleted * 3, // ~3h per machine avg
      },
      streak: streakData,
      activePaths,
      recentActivity,
      heatmap,
    });
  } catch {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
