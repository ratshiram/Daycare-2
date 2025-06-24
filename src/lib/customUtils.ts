export const formatDateForInput = (dateString?: string | Date): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset).toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date for input:", e, "Input:", dateString);
        return '';
    }
};

export const formatDateTimeForInput = (dateTimeString?: string | Date): string => {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() - userTimezoneOffset);
        const year = adjustedDate.getFullYear();
        const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = adjustedDate.getDate().toString().padStart(2, '0');
        const hours = adjustedDate.getHours().toString().padStart(2, '0');
        const minutes = adjustedDate.getMinutes().toString().padStart(2, '0');
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
