import type { Order } from '../../shared/types/models';

export function sortOrdersNewestFirst(orders: readonly Order[]) {
  return [...orders].sort((a, b) => {
    const milliseconds = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (milliseconds) return milliseconds;
    // Java Instant can include precision below the milliseconds retained by Date.parse.
    const aFraction = (a.createdAt.match(/\.(\d+)/)?.[1] ?? '').padEnd(9, '0');
    const bFraction = (b.createdAt.match(/\.(\d+)/)?.[1] ?? '').padEnd(9, '0');
    return bFraction.localeCompare(aFraction) || b.id.localeCompare(a.id);
  });
}
