export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  roles: string[];
}
