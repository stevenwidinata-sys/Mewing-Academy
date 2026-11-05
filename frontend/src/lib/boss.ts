/** HP needed to beat the boss: 60% of the questions, at least 2. */
export const bossHp = (total: number) => Math.max(2, Math.ceil(total * 0.6));
