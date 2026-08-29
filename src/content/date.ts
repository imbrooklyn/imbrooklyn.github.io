const englishDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function formatPostDate(date: Date): string {
  return englishDateFormatter.format(date);
}

export function formatPostDateAttribute(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function hasMeaningfulUpdate(date: Date, updated?: Date): updated is Date {
  return updated !== undefined && updated.getTime() !== date.getTime();
}
