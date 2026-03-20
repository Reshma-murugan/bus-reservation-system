export const formatTimeTo12h = (timeStr) => {
  if (!timeStr) return 'N/A';
  try {
    // Handle HH:mm or HH:mm:ss
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const m = minutes.substring(0, 2).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeStr;
  }
};

export const formatDateTimeTo12h = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};
