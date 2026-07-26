import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Recursively sanitizes strings in an object/array to replace AI-generated formatting
// errors like "/n" or literal "\\n" with actual newlines.
export function sanitizeParsedJSON(obj: any): any {
  if (typeof obj === 'string') {
    // Replace "/n" or literal "\n" with an actual newline character
    let s = obj.replace(/\/n/g, '\n').replace(/\\n/g, '\n');
    // Replace "/t" or literal "\t" with an actual tab character
    s = s.replace(/\/t/g, '\t').replace(/\\t/g, '\t');
    return s;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeParsedJSON);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeParsedJSON(v)])
    );
  }
  return obj;
}
