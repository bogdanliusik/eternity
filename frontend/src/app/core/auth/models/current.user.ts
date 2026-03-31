export interface CurrentUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  roles: string[];
}
