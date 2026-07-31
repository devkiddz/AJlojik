import type {
  Prisma,
  WorkspaceRole
} from '@/lib/generated/prisma/client';

export type AssignableAdminTodoUser = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
};

export type AdminTodoWithRelations = Prisma.AdminTodoGetPayload<{
  include: {
    assignee: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    createdBy: {
      select: {
        name: true;
      };
    };
  };
}>;
