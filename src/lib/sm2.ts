export function calculateSM2(
  quality: number, // 0-5
  previousInterval: number,
  previousEf: number,
  previousConsecutiveHit: number
) {
  let consecutiveHit = previousConsecutiveHit;
  let interval = previousInterval;
  let ef = previousEf;

  if (quality >= 3) {
    if (consecutiveHit === 0) {
      interval = 1;
    } else if (consecutiveHit === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * ef);
    }
    consecutiveHit++;
  } else {
    consecutiveHit = 0;
    interval = 1;
  }

  // Calculate new EF
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) {
    ef = 1.3;
  }

  return { interval, ef, consecutiveHit };
}
