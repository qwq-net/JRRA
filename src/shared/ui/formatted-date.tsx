'use client';

import { useEffect, useState } from 'react';
import { formatJST } from '../utils/date';

interface FormattedDateProps {
  date: Date | string | null | undefined;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

/**
 * サーバーとクライアントで表示を一致させるためのコンポーネント。
 * 常に Asia/Tokyo タイムゾーンで表示します。
 */
export function FormattedDate({ date, options, className }: FormattedDateProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  // サーバーサイドおよびマウント前は標準的な形式で（または非表示で）描画
  // suppressHydrationWarning を付与して警告を抑制しつつ、マウント後に JST で再描画する
  return (
    <span className={className} suppressHydrationWarning>
      {isMounted ? formatJST(date, options) : ''}
    </span>
  );
}
