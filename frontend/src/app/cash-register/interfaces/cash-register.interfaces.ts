// frontend/src/app/cash-register/interfaces/cash-register.interfaces.ts

export interface CashRegister {
    id: string;
    openingAmount: number;
    closingAmount?: number;
    expectedAmount?: number;
    differenceAmount?: number;
    status: 'open' | 'closed' | 'balanced';
    openedBy: string;
    closedBy?: string;
    openingNotes?: string;
    closingNotes?: string;
    openedAt: string;
    closedAt?: string;
    currentBalance?: number;
    transactions?: CashTransaction[];
  }
  
  export interface CashTransaction {
    id: string;
    cashRegisterId: string;
    orderId?: string;
    type: 'income' | 'expense' | 'deposit' | 'withdrawal' | 'adjustment';
    amount: number;
    paymentMethod: string;
    description?: string;
    reference?: string;
    createdBy: string;
    createdAt: string;
    order?: {
      id: string;
      orderCode: string;
      totalAmount: number;
    };
  }
  
  export interface CashSummary {
    openingAmount: number;
    totalIncome: number;
    totalExpenses: number;
    cashSales: number;
    cardSales: number;
    transferSales: number;
    depositsReceived: number;
    currentBalance: number;
    expectedBalance: number;
    difference: number;
  }
  
  export interface OrderInQueue {
    id: string;
    orderId: string;
    priority: number;
    queuePosition: number;
    status: 'waiting' | 'called' | 'processed';
    calledAt?: string;
    processedAt?: string;
    createdAt: string;
    order: {
      id: string;
      orderCode: string;
      type: 'order' | 'reservation' | 'delivery' | 'dine_in';
      status: string;
      customerName: string;
      totalAmount: number;
      paymentMethod?: string;
    };
  }
  
  export interface CreateTransactionRequest {
    cashRegisterId: string;
    orderId?: string;
    type: CashTransaction['type'];
    amount: number;
    paymentMethod?: string;
    description?: string;
    reference?: string;
  }
  
  export interface OpenRegisterRequest {
    openingAmount: number;
    openingNotes?: string;
  }
  
  export interface CloseRegisterRequest {
    closingAmount: number;
    closingNotes?: string;
  }
  
  export interface UserPermissions {
    canViewBalance: boolean;
    canOpenRegister: boolean;
    canCloseRegister: boolean;
    canAddTransaction: boolean;
    canViewTransactions: boolean;
    canProcessPayments: boolean;
  }