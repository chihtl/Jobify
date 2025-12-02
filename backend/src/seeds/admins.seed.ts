import { AdminRole } from '../common/enums';

export const adminsData = [
  {
    email: 'admin@jobify.com',
    password: 'admin123456',
    role: AdminRole.SUPERADMIN,
    name: 'Super Administrator',
  },
  {
    email: 'moderator@jobify.com',
    password: 'mod123456',
    role: AdminRole.MODERATOR,
    name: 'System Moderator',
  },
];
