-- Warden Labs - Database Schema
-- Ejecutar en Supabase SQL Editor

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "techniques" TEXT[],
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserMachine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    CONSTRAINT "UserMachine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CertificationPath" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "CertificationPath_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PathWeek" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    CONSTRAINT "PathWeek_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PathWeekMachine" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "orderNum" INTEGER NOT NULL,
    CONSTRAINT "PathWeekMachine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCertPath" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "UserCertPath_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "totalDaysActive" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Machine_name_key" ON "Machine"("name");
CREATE UNIQUE INDEX "UserMachine_userId_machineId_key" ON "UserMachine"("userId", "machineId");
CREATE UNIQUE INDEX "CertificationPath_name_key" ON "CertificationPath"("name");
CREATE UNIQUE INDEX "CertificationPath_slug_key" ON "CertificationPath"("slug");
CREATE UNIQUE INDEX "PathWeek_pathId_weekNumber_key" ON "PathWeek"("pathId", "weekNumber");
CREATE UNIQUE INDEX "PathWeekMachine_weekId_machineId_key" ON "PathWeekMachine"("weekId", "machineId");
CREATE UNIQUE INDEX "UserCertPath_userId_pathId_key" ON "UserCertPath"("userId", "pathId");
CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");

-- Foreign Keys
ALTER TABLE "UserMachine" ADD CONSTRAINT "UserMachine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserMachine" ADD CONSTRAINT "UserMachine_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathWeek" ADD CONSTRAINT "PathWeek_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "CertificationPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathWeekMachine" ADD CONSTRAINT "PathWeekMachine_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "PathWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathWeekMachine" ADD CONSTRAINT "PathWeekMachine_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCertPath" ADD CONSTRAINT "UserCertPath_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCertPath" ADD CONSTRAINT "UserCertPath_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "CertificationPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
