/**
 * One spreadsheet cell, quoted. A value starting with = + - @ or a tab or
 * carriage return is a formula to Excel and Sheets, and names and narrations
 * come from other people, so those get a leading apostrophe: shown as text,
 * never run.
 */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
