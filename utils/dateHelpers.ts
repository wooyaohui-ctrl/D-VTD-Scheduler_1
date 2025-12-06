export const formatDate = (date: Date): string => {
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatMonthYear = (date: Date): string => {
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return d;
  const day = d.getDay();
  // Adjust to start on Monday (1).
  // If day is Sunday (0), diff is -6. If Monday (1), diff is 0.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getDaysInMonth = (date: Date): Date[] => {
  if (isNaN(date.getTime())) return [];

  const year = date.getFullYear();
  const month = date.getMonth();
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad start to Monday
  let current = new Date(firstDay);
  // getDay(): Su=0, Mo=1, Tu=2... We want to iterate back until we hit Monday (1).
  while (current.getDay() !== 1) {
    current.setDate(current.getDate() - 1);
  }
  const startDate = new Date(current);

  // Pad end to Sunday
  current = new Date(lastDay);
  // We want to iterate forward until we hit Sunday (0).
  while (current.getDay() !== 0) {
    current.setDate(current.getDate() + 1);
  }
  const endDate = new Date(current);

  const iterator = new Date(startDate);
  // Safety break to prevent infinite loops if something goes wrong with date math
  let count = 0;
  while (iterator <= endDate && count < 100) {
    days.push(new Date(iterator));
    iterator.setDate(iterator.getDate() + 1);
    count++;
  }

  return days;
};
