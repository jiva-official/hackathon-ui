export const convertToUTC = (date: Date): string => {
    return date.toISOString();
};

export const convertFromUTC = (utcDate: string): Date => {
    return new Date(utcDate);
};

export const formatLocalDateTime = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
};

const formatDateWithTimezone = (date: string) => {
  // Create a date object in UTC
  const utcDate = new Date(date);
  
  // Format the date in user's local timezone with timezone name
  return new Date(utcDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

// For timer calculations, convert UTC to local time
const convertUTCToLocal = (utcDate: string): Date => {
  return new Date(utcDate);
};