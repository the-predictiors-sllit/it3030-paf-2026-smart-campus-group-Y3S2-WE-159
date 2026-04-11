
import { parse, format } from 'date-fns';

export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '';
  
  // Take '08:00:00' from '08:00:00.0000000'
  const timePart = time.substring(0, 8);
  
  // Parse and format
  return format(parse(timePart, 'HH:mm:ss', new Date()), 'h:mm a');
};