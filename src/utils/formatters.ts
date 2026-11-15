/**
 * Indian currency and date/time formatters according to spec
 */

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDateIndian(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return dateInput.toString();
    
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

export function formatTimeString(time24: string): string {
  // Converts "09:00" or "21:30" to "9 am" or "9:30 pm"
  if (!time24 || !time24.includes(':')) return time24;
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 am
  
  if (minutes > 0) {
    const minPadded = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minPadded} ${ampm}`;
  }
  return `${hours} ${ampm}`;
}

export function formatPhoneNumberIndian(phone?: string): string {
  if (!phone) return '';
  // Clean string and standardize display
  return phone.trim();
}
