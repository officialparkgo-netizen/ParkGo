/**
 * Host payout protection window: money is held for `holdDays` after pick-up
 * so damage claims can land before the payout unlocks. 0 disables the hold.
 */
export function payoutAvailableAt(endAt: string, holdDays: number): Date {
  return new Date(new Date(endAt).getTime() + Math.max(0, holdDays) * 86_400_000);
}

export function isPayoutReleasable(
  endAt: string,
  holdDays: number,
  now: number = Date.now()
): boolean {
  return payoutAvailableAt(endAt, holdDays).getTime() <= now;
}
