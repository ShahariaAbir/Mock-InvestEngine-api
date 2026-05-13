export type MarketEventType = 'profit' | 'loss';

export type MarketTimeWindow = {
  /** GMT+6 time in HH:mm 24-hour format. */
  start: string;
  /** GMT+6 time in HH:mm 24-hour format. */
  end: string;
  /** Chance percentage (0-100) that this window controls the next log direction. */
  chance: number;
};

export type CompanyMarketSchedule = {
  companyName: string;
  mostlyProfit: MarketTimeWindow[];
  mostlyLoss: MarketTimeWindow[];
};

export type MarketBiasResult = {
  eventType: MarketEventType;
  roi: number;
  scheduleReason: string;
  gmtPlus6Time: string;
  matchedWindow?: MarketTimeWindow;
};

export const MARKET_TIMEZONE_LABEL = 'GMT+6';
const GMT_PLUS_6_OFFSET_MINUTES = 6 * 60;

/**
 * ✏️ Edit this section to control company-specific daily profit/loss periods.
 *
 * All time values are interpreted as GMT+6 using 24-hour HH:mm format.
 * - mostlyProfit: during this time, the company has the configured chance to profit.
 * - mostlyLoss: during this time, the company has the configured chance to lose.
 * - Outside these windows, DEFAULT_PROFIT_CHANCE is used.
 */
export const COMPANY_MARKET_SCHEDULES: CompanyMarketSchedule[] = [
  {
    companyName: 'CocaCola',
    mostlyProfit: [{ start: '08:00', end: '11:30', chance: 82 }],
    mostlyLoss: [{ start: '19:00', end: '21:00', chance: 68 }],
  },
  {
    companyName: 'Nvadia',
    mostlyProfit: [{ start: '13:00', end: '16:30', chance: 88 }],
    mostlyLoss: [{ start: '02:00', end: '04:30', chance: 72 }],
  },
  {
    companyName: 'Microsoft',
    mostlyProfit: [{ start: '10:00', end: '13:00', chance: 80 }],
    mostlyLoss: [{ start: '22:00', end: '23:59', chance: 65 }],
  },
  {
    companyName: 'Apple',
    mostlyProfit: [{ start: '16:00', end: '18:30', chance: 84 }],
    mostlyLoss: [{ start: '05:00', end: '07:00', chance: 70 }],
  },
  {
    companyName: 'Samsung',
    mostlyProfit: [{ start: '20:00', end: '23:00', chance: 78 }],
    mostlyLoss: [{ start: '11:30', end: '13:00', chance: 66 }],
  },
];

const DEFAULT_PROFIT_CHANCE = 70;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getGmtPlus6Minutes(date: Date): number {
  const shiftedDate = new Date(date.getTime() + GMT_PLUS_6_OFFSET_MINUTES * 60 * 1000);
  return shiftedDate.getUTCHours() * 60 + shiftedDate.getUTCMinutes();
}

function formatGmtPlus6Time(date: Date): string {
  const shiftedDate = new Date(date.getTime() + GMT_PLUS_6_OFFSET_MINUTES * 60 * 1000);
  const hours = shiftedDate.getUTCHours().toString().padStart(2, '0');
  const minutes = shiftedDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isInsideWindow(currentMinutes: number, window: MarketTimeWindow): boolean {
  const startMinutes = parseTimeToMinutes(window.start);
  const endMinutes = parseTimeToMinutes(window.end);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // Supports overnight windows such as 22:00-02:00.
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

function findActiveWindow(windows: MarketTimeWindow[], currentMinutes: number): MarketTimeWindow | undefined {
  return windows.find((window) => isInsideWindow(currentMinutes, window));
}

function getCompanySchedule(companyName: string): CompanyMarketSchedule | undefined {
  return COMPANY_MARKET_SCHEDULES.find(
    (schedule) => schedule.companyName.toLowerCase() === companyName.toLowerCase()
  );
}

function calculateSignedROI(volatilityFactor: number, eventType: MarketEventType): number {
  const baseRoi = eventType === 'profit' ? Math.random() * 8 : -Math.random() * 5;
  return parseFloat((baseRoi * volatilityFactor).toFixed(2));
}

export function calculateScheduledROI(
  companyName: string,
  volatilityFactor: number,
  now: Date = new Date()
): MarketBiasResult {
  const currentMinutes = getGmtPlus6Minutes(now);
  const gmtPlus6Time = formatGmtPlus6Time(now);
  const schedule = getCompanySchedule(companyName);

  if (!schedule) {
    const eventType: MarketEventType = Math.random() < DEFAULT_PROFIT_CHANCE / 100 ? 'profit' : 'loss';

    return {
      eventType,
      roi: calculateSignedROI(volatilityFactor, eventType),
      scheduleReason: `No company schedule found; used default ${DEFAULT_PROFIT_CHANCE}% profit chance`,
      gmtPlus6Time,
    };
  }

  const activeProfitWindow = findActiveWindow(schedule.mostlyProfit, currentMinutes);
  if (activeProfitWindow) {
    const eventType: MarketEventType = Math.random() < activeProfitWindow.chance / 100 ? 'profit' : 'loss';

    return {
      eventType,
      roi: calculateSignedROI(volatilityFactor, eventType),
      scheduleReason: `${companyName} profit window ${activeProfitWindow.start}-${activeProfitWindow.end} ${MARKET_TIMEZONE_LABEL} (${activeProfitWindow.chance}% profit chance)`,
      gmtPlus6Time,
      matchedWindow: activeProfitWindow,
    };
  }

  const activeLossWindow = findActiveWindow(schedule.mostlyLoss, currentMinutes);
  if (activeLossWindow) {
    const eventType: MarketEventType = Math.random() < activeLossWindow.chance / 100 ? 'loss' : 'profit';

    return {
      eventType,
      roi: calculateSignedROI(volatilityFactor, eventType),
      scheduleReason: `${companyName} loss window ${activeLossWindow.start}-${activeLossWindow.end} ${MARKET_TIMEZONE_LABEL} (${activeLossWindow.chance}% loss chance)`,
      gmtPlus6Time,
      matchedWindow: activeLossWindow,
    };
  }

  const eventType: MarketEventType = Math.random() < DEFAULT_PROFIT_CHANCE / 100 ? 'profit' : 'loss';

  return {
    eventType,
    roi: calculateSignedROI(volatilityFactor, eventType),
    scheduleReason: `Outside configured windows; used default ${DEFAULT_PROFIT_CHANCE}% profit chance`,
    gmtPlus6Time,
  };
}
