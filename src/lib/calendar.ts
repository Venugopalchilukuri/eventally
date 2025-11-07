// Calendar integration utilities
// Generate calendar links and .ics files for events

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string;  // HH:MM (optional, defaults to 1 hour after start)
  eventId: string;
}

// Format date and time for calendar URLs
function formatDateTime(date: string, time: string): string {
  // Convert YYYY-MM-DD and HH:MM to YYYYMMDDTHHmmss
  const dateStr = date.replace(/-/g, '');
  const timeStr = time.replace(/:/g, '') + '00';
  return `${dateStr}T${timeStr}`;
}

// Calculate end time (1 hour after start if not provided)
function getEndTime(startTime: string, endTime?: string): string {
  if (endTime) return endTime;
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHour = (hours + 1) % 24;
  return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Generate Google Calendar URL
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const endTime = getEndTime(event.startTime, event.endTime);
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTime(event.startDate, endTime);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startDateTime}/${endDateTime}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook Calendar URL
export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const endTime = getEndTime(event.startTime, event.endTime);
  const startDateTime = `${event.startDate}T${event.startTime}:00`;
  const endDateTime = `${event.startDate}T${endTime}:00`;
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDateTime,
    enddt: endDateTime,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate Yahoo Calendar URL
export function getYahooCalendarUrl(event: CalendarEvent): string {
  const endTime = getEndTime(event.startTime, event.endTime);
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTime(event.startDate, endTime);
  
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description,
    in_loc: event.location,
    st: startDateTime,
    et: endDateTime,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

// Generate .ics file content (for Apple Calendar, Outlook desktop, etc.)
export function generateICS(event: CalendarEvent): string {
  const endTime = getEndTime(event.startTime, event.endTime);
  const startDateTime = formatDateTime(event.startDate, event.startTime);
  const endDateTime = formatDateTime(event.startDate, endTime);
  
  // Get current timestamp for DTSTAMP
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Generate unique UID
  const uid = `${event.eventId}@eventally.com`;
  
  // Escape special characters in text fields
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventally//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeText(event.title)} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

// Download .ics file
export function downloadICS(event: CalendarEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get all calendar options
export function getAllCalendarLinks(event: CalendarEvent) {
  return {
    google: getGoogleCalendarUrl(event),
    outlook: getOutlookCalendarUrl(event),
    yahoo: getYahooCalendarUrl(event),
    ics: generateICS(event),
  };
}
