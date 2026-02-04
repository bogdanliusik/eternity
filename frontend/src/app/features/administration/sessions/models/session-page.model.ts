import { Session } from './session.model';

export interface SessionPage {
  items: Session[];
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
