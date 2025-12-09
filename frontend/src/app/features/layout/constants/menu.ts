import { MenuItem } from '../types/menu-item';
import {
  ChartPie,
  LockKeyhole,
  TriangleAlert,
  Box,
  Download,
  Gift,
  Users,
  Settings,
  Bell,
  Folder,
  UserIcon,
  ClipboardList
} from 'lucide-angular';

export const MENU_ITEM_IDS = {
  REGISTRATION_REQUESTS: 'registration-requests'
} as const;

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Base',
      separator: true,
      items: [
        {
          icon: UserIcon,
          label: 'Profile',
          route: '/profile'
        },
        {
          icon: ChartPie,
          label: 'Dashboard',
          route: '/dashboard',
          children: [{ label: 'Nfts', route: '/dashboard/nfts' }]
        },
        {
          icon: LockKeyhole,
          label: 'Auth',
          route: '/auth',
          children: [
            { label: 'Sign up', route: '/auth/sign-up' },
            { label: 'Sign in', route: '/auth/sign-in' },
            { label: 'Forgot Password', route: '/auth/forgot-password' },
            { label: 'New Password', route: '/auth/new-password' },
            { label: 'Two Steps', route: '/auth/two-steps' }
          ]
        },
        {
          icon: TriangleAlert,
          label: 'Errors',
          route: '/errors',
          children: [
            { label: '404', route: '/errors/404' },
            { label: '500', route: '/errors/500' }
          ]
        },
        {
          icon: Box,
          label: 'Components',
          route: '/components',
          children: [{ label: 'Table', route: '/components/table' }]
        }
      ]
    },
    {
      group: 'Collaboration',
      separator: true,
      items: [
        {
          icon: Download,
          label: 'Download',
          route: '/dashboard'
        },
        {
          icon: Gift,
          label: 'Gift Card',
          route: '/gift'
        },
        {
          icon: Users,
          label: 'Users',
          route: '/users'
        }
      ]
    },
    {
      group: 'Config',
      separator: false,
      items: [
        {
          icon: Settings,
          label: 'Settings',
          route: '/settings'
        },
        {
          icon: Bell,
          label: 'Notifications',
          route: '/gift'
        },
        {
          icon: Folder,
          label: 'Folders',
          route: '/folders',
          children: [
            { label: 'Current Files', route: '/folders/current-files' },
            { label: 'Downloads', route: '/folders/download' },
            { label: 'Trash', route: '/folders/trash' }
          ]
        }
      ]
    },
    {
      group: 'Administration',
      separator: false,
      roles: ['Admin'],
      items: [
        {
          icon: ClipboardList,
          label: 'Registration requests',
          route: '/administration/registration-requests',
          badge: MENU_ITEM_IDS.REGISTRATION_REQUESTS
        }
      ]
    }
  ];
}
