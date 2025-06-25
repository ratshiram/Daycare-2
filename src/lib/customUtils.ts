
export const formatDateForInput = (dateString?: string | Date): string => {
    if (!dateString) return '';
    try {
        // If it's a date-only string (YYYY-MM-DD), append T00:00:00 to ensure it's parsed as local time, not UTC,
        // which avoids off-by-one day errors in different timezones.
        const date = typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/) 
            ? new Date(`${dateString}T00:00:00`)
            : new Date(dateString);

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date for input:", e, "Input:", dateString);
        return '';
    }
};

export const formatDateTimeForInput = (dateTimeString?: string | Date): string => {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        // We get the local date and time components and format them into the required string for datetime-local input.
        // No timezone adjustment is needed here because the input type itself is timezone-agnostic.
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting datetime:", e, "Input:", dateTimeString);
        return '';
    }
};

export const formatTimeFromDateTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting time from datetime:", e, "Input:", dateTimeString);
      return 'N/A';
    }
};

export const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return 'N/A';
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
