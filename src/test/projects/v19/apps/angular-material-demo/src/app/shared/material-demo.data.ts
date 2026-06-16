export interface MaterialEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  squad: string;
  status: 'Ready' | 'Review' | 'Blocked';
  salary: number;
  joinedAt: string;
}

export const materialFeatureHighlights = [
  'Standalone components',
  'Global Material theme',
  'Icon font connected in app shell',
  'Table with sort, filter and paginator',
];

export const materialEmployeesSeed: MaterialEmployee[] = [
  {
    id: 1,
    name: 'Ivan Petrov',
    email: 'ivan.petrov@company.com',
    role: 'Frontend Engineer',
    squad: 'Design Systems',
    status: 'Ready',
    salary: 185000,
    joinedAt: '2022-03-15',
  },
  {
    id: 2,
    name: 'Maria Sidorova',
    email: 'maria.sidorova@company.com',
    role: 'Product Designer',
    squad: 'Growth',
    status: 'Review',
    salary: 172000,
    joinedAt: '2021-11-20',
  },
  {
    id: 3,
    name: 'Alexey Kozlov',
    email: 'alexey.kozlov@company.com',
    role: 'Backend Engineer',
    squad: 'Core Platform',
    status: 'Blocked',
    salary: 210000,
    joinedAt: '2020-08-10',
  },
  {
    id: 4,
    name: 'Olga Novikova',
    email: 'olga.novikova@company.com',
    role: 'Engineering Manager',
    squad: 'Core Platform',
    status: 'Ready',
    salary: 245000,
    joinedAt: '2019-05-03',
  },
  {
    id: 5,
    name: 'Dmitry Volkov',
    email: 'dmitry.volkov@company.com',
    role: 'DevOps Engineer',
    squad: 'Infrastructure',
    status: 'Review',
    salary: 198000,
    joinedAt: '2022-01-12',
  },
  {
    id: 6,
    name: 'Elena Morozova',
    email: 'elena.morozova@company.com',
    role: 'QA Engineer',
    squad: 'Payments',
    status: 'Ready',
    salary: 158000,
    joinedAt: '2023-02-28',
  },
];

export function createMaterialEmployees(): MaterialEmployee[] {
  return materialEmployeesSeed.map(employee => ({ ...employee }));
}
