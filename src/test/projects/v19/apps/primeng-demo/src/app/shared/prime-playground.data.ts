import { MenuItem } from 'primeng/api';

export interface PrimeProduct {
  code: string;
  name: string;
  category: string;
  price: number;
  status: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
}

export const primeCities = [
  { name: 'Moscow', code: 'msk' },
  { name: 'Saint Petersburg', code: 'spb' },
  { name: 'Kazan', code: 'kzn' },
];

export const primeTeams = ['Platform', 'Design Systems', 'QA Guild', 'DX'];

export const primeModes = [
  { label: 'Smoke', value: 'smoke' },
  { label: 'Full', value: 'full' },
  { label: 'Parser', value: 'parser' },
];

export const primeProducts: PrimeProduct[] = [
  {
    code: 'PR-001',
    name: 'Toolbar',
    category: 'Navigation',
    price: 19,
    status: 'INSTOCK',
  },
  {
    code: 'PR-002',
    name: 'Dialog',
    category: 'Overlay',
    price: 24,
    status: 'LOWSTOCK',
  },
  {
    code: 'PR-003',
    name: 'Table',
    category: 'Data',
    price: 31,
    status: 'OUTOFSTOCK',
  },
];

export const primeMenuItems: MenuItem[] = [
  {
    label: 'Playground',
    icon: 'pi pi-home',
  },
  {
    label: 'Forms',
    icon: 'pi pi-pencil',
  },
  {
    label: 'Data',
    icon: 'pi pi-database',
  },
];

export const primeBreadcrumbHome: MenuItem = {
  icon: 'pi pi-home',
};

export const primeBreadcrumbItems: MenuItem[] = [{ label: 'PrimeNG' }, { label: 'E2E Lab' }];

export const primeContextItems: MenuItem[] = [
  { label: 'Inspect', icon: 'pi pi-search' },
  { label: 'Duplicate', icon: 'pi pi-copy' },
  { label: 'Archive', icon: 'pi pi-folder' },
];
