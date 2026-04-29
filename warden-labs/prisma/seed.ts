import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parseMachines } from '../src/lib/seed/parse-machines';
import { v4 as uuid } from 'uuid';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const CERT_PATHS = [
  { name: 'eJPT', slug: 'ejpt', description: 'Preparación para eLearnSecurity Junior Penetration Tester. Aprende los fundamentos de pentesting, enumeración básica y explotación de servicios comunes.', color: '#4CAF50', level: 'Beginner', estimatedHours: 60 },
  { name: 'eWPT', slug: 'ewpt', description: 'Preparación para eLearnSecurity Web Application Penetration Tester. Domina SQL Injection, XSS, SSTI, LFI/RFI y vulnerabilidades web avanzadas.', color: '#2196F3', level: 'Intermediate', estimatedHours: 120 },
  { name: 'OSCP', slug: 'oscp', description: 'Preparación para Offensive Security Certified Professional. El estándar de oro en pentesting. Cubre enumeración, explotación y escalada de privilegios.', color: '#FF5722', level: 'Advanced', estimatedHours: 200 },
  { name: 'OSWE', slug: 'oswe', description: 'Preparación para Offensive Security Web Expert. Análisis de código fuente, deserialización, SSTI avanzado y vulnerabilidades de lógica web.', color: '#9C27B0', level: 'Advanced', estimatedHours: 150 },
  { name: 'eCPPTv3', slug: 'ecpptv3', description: 'Preparación para eLearnSecurity Certified Professional Penetration Tester. Pivoting, chisel, post-explotación y técnicas de red avanzadas.', color: '#FF9800', level: 'Intermediate', estimatedHours: 100 },
  { name: 'Active Directory', slug: 'active-directory', description: 'Domina la explotación de Active Directory. Kerberos, BloodHound, DCSync, delegación y movimiento lateral en entornos Windows corporativos.', color: '#FFC107', level: 'Advanced', estimatedHours: 140 },
  { name: 'eWPTXv2', slug: 'ewptxv2', description: 'Preparación para eLearnSecurity Web Application Penetration Tester eXtreme. Técnicas web avanzadas, bypass de WAF y explotación compleja.', color: '#1565C0', level: 'Expert', estimatedHours: 130 },
  { name: 'OSEP', slug: 'osep', description: 'Preparación para Offensive Security Experienced Penetration Tester. Evasión de defensas, Active Directory avanzado y técnicas post-explotación.', color: '#E91E63', level: 'Expert', estimatedHours: 160 },
  { name: 'Buffer Overflow', slug: 'buffer-overflow', description: 'Domina las técnicas de Buffer Overflow. Ret2libc, ROP chains, bypass de ASLR/NX y explotación binaria en sistemas x32 y x64.', color: '#F44336', level: 'Expert', estimatedHours: 80 },
  { name: 'eCPTXv2', slug: 'ecptxv2', description: 'Preparación para eCPTX. Pivoting avanzado, Docker breakout, Kubernetes y técnicas de post-explotación en entornos complejos.', color: '#F57C00', level: 'Expert', estimatedHours: 110 },
];

async function main() {
  console.log('🗑️  Limpiando base de datos...');
  await prisma.pathWeekMachine.deleteMany();
  await prisma.pathWeek.deleteMany();
  await prisma.userCertPath.deleteMany();
  await prisma.certificationPath.deleteMany();
  await prisma.userMachine.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.user.deleteMany();
  await prisma.machine.deleteMany();

  console.log('📦 Parseando máquinas del spreadsheet...');
  const machineData = parseMachines();
  console.log(`   Encontradas: ${machineData.length} máquinas`);

  console.log('💾 Insertando máquinas...');
  const machineMap: Record<string, string> = {};

  for (const m of machineData) {
    try {
      const machine = await prisma.machine.create({
        data: {
          id: uuid(),
          name: m.name,
          ip: m.ip,
          os: m.os,
          difficulty: m.difficulty,
          techniques: m.techniques,
          certifications: m.certifications,
        },
      });
      machineMap[m.name] = machine.id;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Unique')) {
        console.log(`   ⚠️  Duplicado: ${m.name}`);
      } else {
        console.error(`   ❌ Error: ${m.name}`, msg);
      }
    }
  }
  console.log(`   Insertadas: ${Object.keys(machineMap).length} máquinas`);

  console.log('🛤️  Creando paths de certificación...');
  for (const certDef of CERT_PATHS) {
    // Get machines for this cert
    const certMachines = machineData.filter(m =>
      m.certifications.some(c => c === certDef.name || c.startsWith(certDef.name))
    );

    if (certMachines.length < 4) {
      console.log(`   ⚠️  ${certDef.name}: solo ${certMachines.length} máquinas, saltando`);
      continue;
    }

    // Sort by difficulty
    const diffOrder: Record<string, number> = { 'Fácil': 1, 'Media': 2, 'Difícil': 3, 'Insane': 4 };
    certMachines.sort((a, b) => (diffOrder[a.difficulty] || 5) - (diffOrder[b.difficulty] || 5));

    // Create weeks of 5 machines each
    const machinesPerWeek = 5;
    const totalWeeks = Math.ceil(certMachines.length / machinesPerWeek);
    const cappedWeeks = Math.min(totalWeeks, 20); // Max 20 weeks

    const certPath = await prisma.certificationPath.create({
      data: {
        id: uuid(),
        name: certDef.name,
        slug: certDef.slug,
        description: certDef.description,
        icon: 'target',
        color: certDef.color,
        totalWeeks: cappedWeeks,
        estimatedHours: certDef.estimatedHours,
        level: certDef.level,
      },
    });

    // Create weekly titles based on difficulty progression
    const weekTitles: Record<string, string> = {};
    for (let w = 0; w < cappedWeeks; w++) {
      const start = w * machinesPerWeek;
      const weekMachines = certMachines.slice(start, start + machinesPerWeek);
      const mainDiff = weekMachines[0]?.difficulty || 'Media';

      if (w < cappedWeeks * 0.25) {
        weekTitles[String(w)] = 'Fundamentos y Enumeración';
      } else if (w < cappedWeeks * 0.5) {
        weekTitles[String(w)] = 'Explotación y Técnicas Core';
      } else if (w < cappedWeeks * 0.75) {
        weekTitles[String(w)] = 'Técnicas Intermedias';
      } else {
        weekTitles[String(w)] = 'Desafíos Avanzados';
      }

      const week = await prisma.pathWeek.create({
        data: {
          id: uuid(),
          pathId: certPath.id,
          weekNumber: w + 1,
          title: weekTitles[String(w)],
          description: `Semana ${w + 1} con máquinas de dificultad ${mainDiff}`,
          focus: `${weekMachines.length} máquinas · ${mainDiff}`,
        },
      });

      for (let m = 0; m < weekMachines.length; m++) {
        const machineId = machineMap[weekMachines[m].name];
        if (machineId) {
          await prisma.pathWeekMachine.create({
            data: {
              id: uuid(),
              weekId: week.id,
              machineId,
              orderNum: m + 1,
            },
          });
        }
      }
    }

    console.log(`   ✅ ${certDef.name}: ${cappedWeeks} semanas, ${Math.min(certMachines.length, cappedWeeks * machinesPerWeek)} máquinas`);
  }

  console.log('\n🎉 Seed completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
