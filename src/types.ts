export interface Portfolio {
  id: number | string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  techStack?: string[];
  createdAt?: string;
}

export interface Menu {
  id: number | string;
  label: string;
  link: string;
  content?: string;
  type?: 'portfolio' | 'custom';
}

export const CATEGORIES = [
  'All',
  'Web & Otomasi',
  'Algorithmic Trading',
  'IoT & Hardware'
];
