import differenceInDays from 'date-fns/differenceInDays';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import formatRFC3339 from 'date-fns/formatRFC3339';
import subDays from 'date-fns/subDays';
import subMonths from 'date-fns/subMonths';
import subYears from 'date-fns/subYears';

const MIN_DAYS_IN_MONTH = 28;
const MONTHS_IN_YEAR = 12;
const MIN_YEARS = 18;
const MAX_YEARS = 130;

const getDateRange = (start, end) => {
  const range = [];
  let cur = start;
  while (cur > end) {
    range.push(new Date(cur));
    cur = subDays(cur, 1);
  }
  return range;
};

const formatDistance = (start, end) => {
  const days = differenceInDays(end, start);
  if (days < 0) {
    throw new Error(
      `Negative difference in days: ${days}. Should not be reached.`);
  }

  if (days === 0) {
    // We don't want to report '0 days'. This will leave an extra blank at the
    // end of some days, but that's ok.
    return '';
  }

  if (days === 1) {
    // Separate out 1 day for correct pluralization
    return '1 day';
  }

  if (days < MIN_DAYS_IN_MONTH) {
    // If we're sure there's less than a month's worth just return the days. We
    // will capture days from longer months below.
    return `${days} days`;
  }

  // Get the difference in whole months
  const months = differenceInMonths(end, start);
  if (months < 0) {
    throw new Error(
      `Negative difference in months: ${months}. Should not be reached.`);
  }

  if (months === 0) {
    // If there is no month difference, then we have a month longer than
    // February. Just return the days.
    return `${days} days`;
  }

  if (months === 1) {
    // Get the date that is exactly the number of months away from the end. We
    // will use this to determine the day difference within the month.
    const sameMonthDate = subMonths(end, months);
    // Recursion will give use a number of days less than the length of a month
    const dayDistance = formatDistance(start, sameMonthDate);
    // Separate out 1 month for correct pluralization
    return `1 month ${dayDistance}`;
  }

  if (months < MONTHS_IN_YEAR) {
    // Get the date that is exactly the number of months away from the end. We
    // will use this to determine the day difference within the month.
    const sameMonthDate = subMonths(end, months);
    // Recursion will give use a number of days less than the length of a month
    const dayDistance = formatDistance(start, sameMonthDate);
    return `${months} months ${dayDistance}`;
  }

  // Get the difference in whole years
  const years = differenceInYears(end, start);
  if (years <= 0) {
    // Years should not be 0 because months and days should have already been
    // handled
    throw new Error(
      `Negative difference in years: ${years}. Should not be reached.`);
  }

  // Get the date that is exactly the number of years away from the end. We
  // will use this to determine the month and day difference.
  const sameYearDate = subYears(end, years);
  // Recursion will give use a number of months and days less than the length of
  // a year
  const monthDistance = formatDistance(start, sameYearDate);
  if (years === 1) {
    // Separate out 1 year for correct pluralization
    return `1 year ${monthDistance}`;
  }

  return `${years} years ${monthDistance}`;
};

const createOptionElement = (endDate) => (date) => {
  const elem = document.createElement('option');
  // Set value to ISO 3339 standard for easy parsing on server
  elem.value = formatRFC3339(date);
  elem.textContent = formatDistance(date, endDate);
  return elem;
};

const addOptions = (options) => {
  const select = document.getElementById('date-picker');
  options.forEach((option) => {
    select.appendChild(option);
  });
};

const main = () => {
  const today = new Date();
  const startDate = subYears(today, MAX_YEARS);
  const endDate = subYears(today, MIN_YEARS);
  const range = getDateRange(endDate, startDate);

  const options = range.map(createOptionElement(today));
  addOptions(options);
};

main();
