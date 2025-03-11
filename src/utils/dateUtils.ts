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


// For timer calculations, convert UTC to local time
