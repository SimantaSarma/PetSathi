import { Provider, DaySchedule } from '../types';
import { formatTimeString } from './formatters';

export interface ComputedOpenStatus {
  state: 'open_24x7' | 'open' | 'closing_soon' | 'closed' | 'temporarily_closed' | 'permanently_closed' | 'hours_not_listed';
  displayText: string;
  badgeVariant: 'moss' | 'amber' | 'neutral' | 'alert';
  opensAt?: string;
  closesAt?: string;
  minutesRemaining?: number;
}

/**
 * Returns the current date/time in Asia/Kolkata timezone (or overridden by demo clock)
 */
export function getKolkataDateTime(clockOverride?: string | null): {
  dayOfWeek: number; // 0 = Sun, 1 = Mon...
  currentHour: number;
  currentMinute: number;
  totalCurrentMinutes: number;
  isoDateStr: string;
} {
  let date: Date;

  if (clockOverride) {
    // Clock override can be "02:00", "10:00", "21:00", etc.
    const [h, m] = clockOverride.split(':').map(Number);
    date = new Date();
    date.setHours(h || 0, m || 0, 0, 0);
  } else {
    // Current time in Asia/Kolkata
    const now = new Date();
    // Convert to Asia/Kolkata time string
    const kolkataString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    date = new Date(kolkataString);
  }

  const dayOfWeek = date.getDay();
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const totalCurrentMinutes = currentHour * 60 + currentMinute;

  return {
    dayOfWeek,
    currentHour,
    currentMinute,
    totalCurrentMinutes,
    isoDateStr: date.toISOString(),
  };
}

/**
 * Computes open status for a provider
 */
export function computeProviderOpenStatus(
  provider: Provider,
  clockOverride?: string | null
): ComputedOpenStatus {
  if (provider.status === 'permanently_closed') {
    return {
      state: 'permanently_closed',
      displayText: 'Permanently closed',
      badgeVariant: 'alert',
    };
  }

  if (provider.status === 'temporarily_closed') {
    return {
      state: 'temporarily_closed',
      displayText: 'Temporarily closed',
      badgeVariant: 'neutral',
    };
  }

  if (!provider.hours) {
    return {
      state: 'hours_not_listed',
      displayText: 'Hours not listed',
      badgeVariant: 'neutral',
    };
  }

  if (provider.hours.is24x7 || provider.hours.emergency === '24x7') {
    return {
      state: 'open_24x7',
      displayText: 'Open 24×7',
      badgeVariant: 'moss',
    };
  }

  const { dayOfWeek, totalCurrentMinutes } = getKolkataDateTime(clockOverride);

  // If structured schedules exist, use them
  const schedules = provider.hours.structuredOpd || [];
  if (schedules.length === 0) {
    // Fallback if no structured slots
    return {
      state: 'open',
      displayText: 'Open now · closes 9 pm',
      badgeVariant: 'moss',
    };
  }

  // Find slot for today or overnight slot from yesterday
  const yesterday = (dayOfWeek + 6) % 7;

  // Check if yesterday had an overnight slot that extends into today
  for (const slot of schedules) {
    if (slot.dayOfWeek === yesterday && slot.isOvernight) {
      const [closeH, closeM] = slot.closeTime.split(':').map(Number);
      const closeMinutes = closeH * 60 + closeM;
      if (totalCurrentMinutes < closeMinutes) {
        const remaining = closeMinutes - totalCurrentMinutes;
        const formattedClose = formatTimeString(slot.closeTime);
        if (remaining <= 60) {
          return {
            state: 'closing_soon',
            displayText: `Closing soon · closes ${formattedClose}`,
            badgeVariant: 'amber',
            closesAt: slot.closeTime,
            minutesRemaining: remaining,
          };
        }
        return {
          state: 'open',
          displayText: `Open now · closes ${formattedClose}`,
          badgeVariant: 'moss',
          closesAt: slot.closeTime,
        };
      }
    }
  }

  // Check today's slots
  const todaySlots = schedules.filter((s) => s.dayOfWeek === dayOfWeek);

  for (const slot of todaySlots) {
    const [openH, openM] = slot.openTime.split(':').map(Number);
    const [closeH, closeM] = slot.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    if (slot.isOvernight) {
      closeMinutes += 24 * 60; // extends into next day
    }

    if (totalCurrentMinutes >= openMinutes && totalCurrentMinutes < closeMinutes) {
      const remaining = closeMinutes - totalCurrentMinutes;
      const formattedClose = formatTimeString(slot.closeTime);

      if (remaining <= 60) {
        return {
          state: 'closing_soon',
          displayText: `Closing soon · closes in ${remaining}m`,
          badgeVariant: 'amber',
          closesAt: slot.closeTime,
          minutesRemaining: remaining,
        };
      }

      return {
        state: 'open',
        displayText: `Open now · closes ${formattedClose}`,
        badgeVariant: 'moss',
        closesAt: slot.closeTime,
      };
    }
  }

  // If not open now, find the next opening slot
  // Check upcoming slots today
  for (const slot of todaySlots) {
    const [openH, openM] = slot.openTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    if (totalCurrentMinutes < openMinutes) {
      return {
        state: 'closed',
        displayText: `Closed · opens ${formatTimeString(slot.openTime)}`,
        badgeVariant: 'neutral',
        opensAt: slot.openTime,
      };
    }
  }

  // Check tomorrow's first slot
  const tomorrow = (dayOfWeek + 1) % 7;
  const tomorrowSlots = schedules.filter((s) => s.dayOfWeek === tomorrow);
  if (tomorrowSlots.length > 0) {
    return {
      state: 'closed',
      displayText: `Closed · opens ${formatTimeString(tomorrowSlots[0].openTime)} tomorrow`,
      badgeVariant: 'neutral',
      opensAt: tomorrowSlots[0].openTime,
    };
  }

  return {
    state: 'closed',
    displayText: 'Closed today',
    badgeVariant: 'neutral',
  };
}

/**
 * 24-hour timeline generator for profile: 0 to 23 hours
 * returns an array of 24 booleans indicating if provider is open during hour H
 */
export function get24HourTimeline(
  schedules: DaySchedule[] = [],
  dayOfWeek: number,
  is24x7?: boolean
): boolean[] {
  if (is24x7) {
    return Array(24).fill(true);
  }
  const result = Array(24).fill(false);
  const todaySlots = schedules.filter((s) => s.dayOfWeek === dayOfWeek);

  todaySlots.forEach((slot) => {
    const [openH] = slot.openTime.split(':').map(Number);
    const [closeH] = slot.closeTime.split(':').map(Number);

    if (slot.isOvernight) {
      for (let h = openH; h < 24; h++) result[h] = true;
    } else {
      for (let h = openH; h < closeH; h++) {
        if (h >= 0 && h < 24) result[h] = true;
      }
    }
  });

  // check yesterday's overnight spillover
  const yesterday = (dayOfWeek + 6) % 7;
  const yesterdaySlots = schedules.filter((s) => s.dayOfWeek === yesterday && s.isOvernight);
  yesterdaySlots.forEach((slot) => {
    const [closeH] = slot.closeTime.split(':').map(Number);
    for (let h = 0; h < closeH; h++) {
      if (h < 24) result[h] = true;
    }
  });

  return result;
}
