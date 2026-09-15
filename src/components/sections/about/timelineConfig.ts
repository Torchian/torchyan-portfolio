export type TimelineEntryId = 'apricode' | 'tco' | 'volo' | 'softconstruct' | 'picsart' | 'armenianCodeAcademy';

/** An entry's copy, from messages/*.json under about.timeline.entries.<id>. */
export interface TimelineEntryContent {
  stickyContent: string;
  role: string;
  focus: string;
  impact: string;
  coreGrowth: string[];
}

/** What doesn't change between languages: the years and the company names. */
export interface TimelineEntryConfig {
  id: TimelineEntryId;
  year: string;
  company: string;
}

export type TimelineEntry = TimelineEntryConfig & TimelineEntryContent;

export const TIMELINE_ENTRIES: TimelineEntryConfig[] = [
  { id: 'apricode', year: '2016–2018', company: 'Apricode / MyZCapital' },
  { id: 'tco', year: '2019', company: 'TCO / Brainstorm' },
  { id: 'volo', year: '2020', company: 'VOLO' },
  { id: 'softconstruct', year: '2021–2022', company: 'SoftConstruct' },
  { id: 'picsart', year: '2023–2024', company: 'Picsart' },
  { id: 'armenianCodeAcademy', year: '2024', company: 'Armenian Code Academy' },
];
