export const FIXED_HOLIDAYS = ['01-01', '01-11', '05-01', '07-30', '08-14', '08-20', '08-21', '11-06', '11-18'];

export const RELIGIOUS_HOLIDAYS_2026 = [
  '2026-03-20', '2026-03-21', // Aid Al Fitr (approx)
  '2026-05-27', '2026-05-28', // Aid Al Adha (approx)
  '2026-06-17',               // Fatih Muharram (approx)
  '2026-08-26', '2026-08-27', // Aid Al Mawlid (approx)
];

export function isHoliday(dateStr: string) {
  if (!dateStr) return false;
  const mm_dd = dateStr.substring(5);
  if (FIXED_HOLIDAYS.includes(mm_dd)) return true;
  if (RELIGIOUS_HOLIDAYS_2026.includes(dateStr)) return true;
  return false;
}

export function isWorkingDay(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const isSunday = d.getDay() === 0;
  if (isSunday || isHoliday(dateStr)) return false;
  return true;
}

export function calculateWorkingHours(entree: string | null, sortie: string | null, dateStr: string) {
  if (!entree || !sortie) return 0;
  try {
    const [eH, eM] = entree.split(':').map(Number);
    let [sH, sM] = sortie.split(':').map(Number);
    
    const startHour = eH + eM / 60;
    const endHour = sH + sM / 60;

    if (endHour <= startHour) return 0;

    let total = endHour - startHour;

    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon... 5=Fri, 6=Sat

    // Breakfast: 11:00 to 11:15
    const bStart = 11.0;
    const bEnd = 11.25;

    // Lunch
    const lStart = dayOfWeek === 5 ? 13.5 : 14.0; // Fri: 13:30, Others: 14:00
    const lEnd = 14.75; // 14:45

    // Deduct Breakfast
    if (startHour <= bStart && endHour >= bEnd) {
      total -= (bEnd - bStart);
    } else if (startHour <= bStart && endHour > bStart) {
      total -= (endHour - bStart);
    } else if (startHour < bEnd && endHour >= bEnd) {
      total -= (bEnd - startHour);
    }

    // Deduct Lunch (Sat has no lunch break because work ends at 13:00)
    if (dayOfWeek !== 6) {
      if (startHour <= lStart && endHour >= lEnd) {
        total -= (lEnd - lStart);
      } else if (startHour <= lStart && endHour > lStart) {
        total -= (endHour - lStart);
      } else if (startHour < lEnd && endHour >= lEnd) {
        total -= (lEnd - startHour);
      }
    }

    return total > 0 ? total : 0;
  } catch {
    return 0;
  }
}
