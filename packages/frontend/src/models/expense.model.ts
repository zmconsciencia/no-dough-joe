export type Expense = {
    id: string;
    userId: string;
    categoryId: string;
    date: string;
    amount: number;
    description: string;
    recurringSeriesId?: string | null;
    createdAt: string;
    deletedAt?: string | null;
  };
  
  export type ExpenseWithRelations = Expense & {
    allocations: { id: string; expenseId: string; source: 'CASH'|'MEAL_TICKET'; amount: number }[];
    category: { id: string; name: string; color: string; eligibleForMealTicket: boolean };
  };
  