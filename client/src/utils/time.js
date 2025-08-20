import { DateTime } from 'luxon';

export function formatToWIBFull(utcString) {
  if (!utcString) return "-";
  try {
    return DateTime
      .fromISO(utcString, { zone: 'utc' })
      .setZone('Asia/Jakarta')
      .setLocale('id')
      // append literal WIB to make timezone explicit for Indonesia (WIB = UTC+7)
      .toFormat("cccc, dd LLLL yyyy HH:mm 'WIB'");
  } catch (err) {
    return String(utcString);
  }
}
