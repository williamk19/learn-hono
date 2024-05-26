export enum RoleEnum {
  Admin = 'ROLE_ADMIN',
  Pm = 'ROLE_PM',
  Employee = 'ROLE_EMPLOYEE',
}

export type TaskType = {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
  };
};
