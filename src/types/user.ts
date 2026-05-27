export type UserRole = "BRANCH_STAFF" | "BRANCH_MGR" | "HQ_RECEPTION" | "HQ_REVIEWER" | "HQ_APPROVER" | "HQ_ADMIN" | "AUDITOR" | "SYS_ADMIN";

export interface User {
  userId: string;
  employeeNo: string;
  name: string;
  email: string;
  role: UserRole;
  branchCode: string | null;
  branchName: string | null;
}
