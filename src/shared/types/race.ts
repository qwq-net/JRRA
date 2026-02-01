export const RACE_SURFACES = ['芝', 'ダート'] as const;
export type RaceSurface = (typeof RACE_SURFACES)[number];

export const RACE_CONDITIONS = ['良', '稍重', '重', '不良'] as const;
export type RaceCondition = (typeof RACE_CONDITIONS)[number];

export const RACE_STATUSES = ['SCHEDULED', 'CLOSED', 'FINALIZED', 'CANCELLED'] as const;
export type RaceStatus = (typeof RACE_STATUSES)[number];
