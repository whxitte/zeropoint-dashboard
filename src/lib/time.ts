import { formatDistanceToNow, parseISO } from "date-fns";

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function absoluteTime(iso: string): string {
  try {
    return parseISO(iso).toLocaleString();
  } catch {
    return iso;
  }
}
