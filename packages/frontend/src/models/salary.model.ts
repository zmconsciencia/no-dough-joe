export type SalaryMonth = {
  id: string;
  userId: string;
  month: string;
  amount: number;
  createdAt: string;
};

export type SetSalaryInput = {
  month?: string;
  amount: number;
};
