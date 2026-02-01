export const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * DateオブジェクトをJSTの文字列（YYYY-MM-DDTHH:mm）に変換します。
 * datetime-local の初期値などに使用します。
 */
export function toJSTString(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: JST_TIMEZONE,
  })
    .format(d)
    .replace(/\//g, '-')
    .replace(/ /g, 'T')
    .slice(0, 16);
}

/**
 * JSTの文字列（YYYY-MM-DDTHH:mm）をUTCのDateオブジェクトに変換します。
 * datetime-local からの値（TZなし）をJSTとして解釈します。
 */
export function parseJSTToUTC(jstString: string | null | undefined): Date | null {
  if (!jstString) return null;
  // ブラウザの datetime-local は TZ 情報を持たないため、強制的に JST として解釈させる
  const date = new Date(`${jstString}:00+09:00`);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 指定したフォーマットでJSTを表示します。
 */
export function formatJST(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    ...options,
    timeZone: JST_TIMEZONE,
  }).format(d);
}
