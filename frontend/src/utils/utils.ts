import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict';
import format from 'date-fns/format';

export const formatDate = (dateString: string): string =>
  format(new Date(dateString), 'MMM d, yyyy');

export const formatRelativeDate = (dateString: string): string =>
  formatDistanceToNowStrict(new Date(dateString), { addSuffix: true });

export const generateSlug = (input: string): string =>
  input
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/ +/g, ' ') // merge multiple spaces in a row
    .replace(/\s/g, '-')
    .toLowerCase();
