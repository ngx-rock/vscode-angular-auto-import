export interface NzTableItem {
  name: string;
  team: string;
  status: 'Ready' | 'Review' | 'Blocked';
  score: number;
}

export const nzTableItems: NzTableItem[] = [
  { name: 'Autocomplete', team: 'Forms', status: 'Ready', score: 91 },
  { name: 'Table', team: 'Data', status: 'Review', score: 84 },
  { name: 'Modal', team: 'Overlay', status: 'Blocked', score: 72 },
];

export const nzTreeNodes = [
  {
    title: 'workspace',
    key: '0',
    children: [
      { title: 'components', key: '0-0' },
      { title: 'directives', key: '0-1' },
      { title: 'overlays', key: '0-2' },
    ],
  },
];
