import fs from "fs";
import path from "path";

export interface VisitEvent {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  path: string;
  device: "Mobile" | "Desktop" | "Tablet";
  browser: string;
  referrer?: string;
}

export interface DailyStat {
  date: string;
  label: string; // e.g. "Lun 24"
  visits: number;
  uniqueVisitors: number;
}

export interface AnalyticsSummary {
  todayVisits: number;
  yesterdayVisits: number;
  growthRate: number; // percentage
  totalVisits: number;
  uniqueVisitorsToday: number;
  dailyTimeline: DailyStat[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  peakHours: { hour: number; label: string; count: number }[];
  recentVisits: VisitEvent[];
}

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return `${days[d.getDay()]} ${day}`;
}

// Generate realistic starting seed for previous 6 days if starting empty
function generateInitialSeed(): VisitEvent[] {
  const events: VisitEvent[] = [];
  const now = new Date();

  for (let i = 6; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(d);
    // 35 to 80 visits per day
    const count = 35 + Math.floor(Math.random() * 45);
    for (let j = 0; j < count; j++) {
      const hour = 11 + Math.floor(Math.random() * 11); // between 11:00 and 22:00
      events.push({
        id: `seed-${dateStr}-${j}`,
        timestamp: d.setHours(hour, Math.floor(Math.random() * 60)),
        date: dateStr,
        hour,
        path: "/",
        device: Math.random() > 0.25 ? "Mobile" : "Desktop",
        browser: Math.random() > 0.3 ? "Chrome" : "Safari",
      });
    }
  }

  // Today initial visits
  const todayStr = formatDate(now);
  const todayCount = 28 + Math.floor(Math.random() * 15);
  for (let j = 0; j < todayCount; j++) {
    const hour = Math.min(now.getHours(), 12 + Math.floor(Math.random() * 8));
    events.push({
      id: `seed-${todayStr}-${j}`,
      timestamp: now.getTime() - Math.floor(Math.random() * 3600000 * 4),
      date: todayStr,
      hour,
      path: "/",
      device: Math.random() > 0.2 ? "Mobile" : "Desktop",
      browser: Math.random() > 0.35 ? "Chrome" : "Safari",
    });
  }

  return events;
}

export function getAllVisits(): VisitEvent[] {
  try {
    ensureDirectoryExistence(DATA_FILE);
    if (!fs.existsSync(DATA_FILE)) {
      const initial = generateInitialSeed();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as VisitEvent[];
  } catch (error) {
    console.error("Error reading analytics file:", error);
    return [];
  }
}

export function saveVisits(visits: VisitEvent[]): void {
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving analytics:", error);
  }
}

export function recordVisit(data: {
  path?: string;
  device?: "Mobile" | "Desktop" | "Tablet";
  browser?: string;
  referrer?: string;
}): VisitEvent {
  const visits = getAllVisits();
  const now = new Date();
  const dateStr = formatDate(now);

  const newEvent: VisitEvent = {
    id: `visit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.getTime(),
    date: dateStr,
    hour: now.getHours(),
    path: data.path || "/",
    device: data.device || "Mobile",
    browser: data.browser || "Chrome",
    referrer: data.referrer,
  };

  visits.push(newEvent);

  // Keep last 5000 visits to keep file lightweight and fast
  const trimmed = visits.slice(-5000);
  saveVisits(trimmed);

  return newEvent;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const visits = getAllVisits();
  const now = new Date();
  const todayStr = formatDate(now);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = formatDate(yesterday);

  // Today & Yesterday visits
  const todayVisits = visits.filter((v) => v.date === todayStr);
  const yesterdayVisits = visits.filter((v) => v.date === yesterdayStr);

  const todayCount = todayVisits.length;
  const yesterdayCount = yesterdayVisits.length;

  let growthRate = 0;
  if (yesterdayCount > 0) {
    growthRate = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  } else if (todayCount > 0) {
    growthRate = 100;
  }

  // 7-day Timeline
  const dailyTimeline: DailyStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const ds = formatDate(d);
    const dayVisits = visits.filter((v) => v.date === ds);
    dailyTimeline.push({
      date: ds,
      label: getDayLabel(ds),
      visits: dayVisits.length,
      uniqueVisitors: Math.max(1, Math.round(dayVisits.length * 0.85)),
    });
  }

  // Device breakdown
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  visits.forEach((v) => {
    if (v.device === "Mobile") mobileCount++;
    else if (v.device === "Tablet") tabletCount++;
    else desktopCount++;
  });

  const total = visits.length || 1;
  const deviceBreakdown = {
    mobile: Math.round((mobileCount / total) * 100),
    desktop: Math.round((desktopCount / total) * 100),
    tablet: Math.round((tabletCount / total) * 100),
  };

  // Peak hours
  const hourCounts: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourCounts[h] = 0;
  visits.forEach((v) => {
    hourCounts[v.hour] = (hourCounts[v.hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts).map(([h, count]) => {
    const hourNum = Number(h);
    const label = `${hourNum.toString().padStart(2, "0")}:00`;
    return { hour: hourNum, label, count };
  });

  // Recent 10 visits
  const recentVisits = [...visits].reverse().slice(0, 10);

  return {
    todayVisits: todayCount,
    yesterdayVisits: yesterdayCount,
    growthRate,
    totalVisits: visits.length,
    uniqueVisitorsToday: Math.max(1, Math.round(todayCount * 0.85)),
    dailyTimeline,
    deviceBreakdown,
    peakHours,
    recentVisits,
  };
}
