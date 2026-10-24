/**
 * Checks whether a scheduled departure date and 12-hour/24-hour time has already passed
 * in East Africa Time (UTC+03:00, Ethiopian local time).
 */
export function hasTripDeparted(departureDate?: string, departureTime?: string): boolean {
  if (!departureDate) return false;

  const match = (departureTime || '').match(/(\d+):(\d+)\s*(AM|PM)?/i);
  let hours = 0;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }

  const datePart = (departureDate || '').split('T')[0].trim();
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  // East Africa Time (Ethiopian standard time) is UTC+03:00
  const departureIso = `${datePart}T${hh}:${mm}:00+03:00`;
  const departureDateObj = new Date(departureIso);

  if (isNaN(departureDateObj.getTime())) {
    return false;
  }

  return Date.now() >= departureDateObj.getTime();
}
