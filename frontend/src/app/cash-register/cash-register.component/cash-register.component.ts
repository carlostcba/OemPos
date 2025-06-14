// frontend/src/app/cash-register/cash-register.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Subject, takeUntil, combineLatest, interval } from 'rxjs';

import { CashRegisterService } from '../services/cash-register.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  CashRegister, 
  CashSummary, 
  OrderInQueue,
  UserPermissions,
  OpenRegisterRequest,
  CloseRegisterRequest,
  CreateTransactionRequest
} from '../interfaces/cash-register.interfaces';
import { CashAmountPipe, OrderTypePipe, OrderStatusPipe } from '../pipes/cash-format.pipes';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashAmountPipe,
    OrderTypePipe,
    OrderStatusPipe
  ]
})
export class CashRegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  currentRegister: CashRegister | null = null;
  cashSummary: CashSummary | null = null;
  orderQueue: OrderInQueue[] = [];
  currentUser: any = null;
  userPermissions: UserPermissions = {
    canViewBalance: false,
    canOpenRegister: false,
    canCloseRegister: false,
    canAddTransaction: false,
    canViewTransactions: false,
    canProcessPayments: false
  };
  
  // UI State
  loading = false;
  queueFilter = 'all'; // 'all', 'orders', 'reservations'
  searchTerm = '';
  
  // Auto-refresh
  autoRefresh = true;
  refreshInterval = 30000; // 30 seconds

  constructor(
    private cashRegisterService: CashRegisterService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadInitialData();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== INITIALIZATION =====

  private loadCurrentUser() {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.setUserPermissions(user);
      });
  }

  private setUserPermissions(user: any) {
    if (!user) return;
    
    const roles = user.roles || [];
    const permissions = user.permissions || [];
    
    this.userPermissions = {
      canViewBalance: roles.includes('admin') || roles.includes('manager'),
      canOpenRegister: permissions.includes('open_register') || roles.includes('cashier') || roles.includes('admin'),
      canCloseRegister: permissions.includes('close_register') || roles.includes('cashier') || roles.includes('admin'),
      canAddTransaction: permissions.includes('add_transaction') || roles.includes('cashier') || roles.includes('admin'),
      canViewTransactions: permissions.includes('view_transactions') || roles.includes('cashier') || roles.includes('admin'),
      canProcessPayments: permissions.includes('process_payments') || roles.includes('cashier') || roles.includes('admin')
    };
  }

  private loadInitialData() {
    this.loading = true;
    
    combineLatest([
      this.cashRegisterService.getCurrentRegister(),
      this.cashRegisterService.getCashSummary(),
      this.cashRegisterService.getOrderQueue()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([register, summary, queue]) => {
        this.currentRegister = register;
        this.cashSummary = summary;
        this.orderQueue = queue;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.loading = false;
        this.showToast('Error loading data', 'danger');
      }
    });
  }

  private setupAutoRefresh() {
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.autoRefresh) {
          this.refreshData();
        }
      });
  }

  // ===== REGISTER OPERATIONS =====

  async openRegister() {
    const alert = await this.alertCtrl.create({
      header: 'Open Register',
      message: 'Enter the opening amount:',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Opening amount',
          min: 0,
          value: '0.00'
        },
        {
          name: 'notes',
          type: 'textarea',
          placeholder: 'Notes (optional)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Open',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount < 0) {
              this.showToast('Invalid amount', 'danger');
              return false;
            }

            const loading = await this.loadingCtrl.create({
              message: 'Opening register...'
            });
            await loading.present();

            try {
              const request: OpenRegisterRequest = {
                openingAmount: amount,
                openingNotes: data.notes || undefined
              };

              await this.cashRegisterService.openRegister(request).toPromise();
              await loading.dismiss();
              this.showToast('Register opened successfully', 'success');
              this.refreshData();
            } catch (error) {
              await loading.dismiss();
              console.error('Error opening register:', error);
              this.showToast('Error opening register', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async closeRegister() {
    if (!this.currentRegister) {
      this.showToast('No register is open', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Close Register',
      message: `Expected amount: ${this.cashSummary?.expectedBalance || 0}. Enter the actual cash count:`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Closing amount',
          min: 0,
          value: this.cashSummary?.expectedBalance?.toString() || '0.00'
        },
        {
          name: 'notes',
          type: 'textarea',
          placeholder: 'Notes (optional)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Close',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount < 0) {
              this.showToast('Invalid amount', 'danger');
              return false;
            }

            const loading = await this.loadingCtrl.create({
              message: 'Closing register...'
            });
            await loading.present();

            try {
              const request: CloseRegisterRequest = {
                closingAmount: amount,
                closingNotes: data.notes || undefined
              };

              await this.cashRegisterService.closeRegister(request).toPromise();
              await loading.dismiss();
              this.showToast('Register closed successfully', 'success');
              this.refreshData();
            } catch (error) {
              await loading.dismiss();
              console.error('Error closing register:', error);
              this.showToast('Error closing register', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // ===== TRANSACTION OPERATIONS =====

  async addManualTransaction() {
    const alert = await this.alertCtrl.create({
      header: 'Add Manual Transaction',
      inputs: [
        {
          name: 'type',
          type: 'radio',
          label: 'Income',
          value: 'income',
          checked: true
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Expense',
          value: 'expense'
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount',
          min: 0
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description'
        },
        {
          name: 'reference',
          type: 'text',
          placeholder: 'Reference (optional)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount <= 0) {
              this.showToast('Invalid amount', 'danger');
              return false;
            }

            if (!data.description?.trim()) {
              this.showToast('Description is required', 'danger');
              return false;
            }

            try {
              const request: CreateTransactionRequest = {
                cashRegisterId: this.currentRegister!.id,
                type: data.type,
                amount,
                paymentMethod: 'cash',
                description: data.description,
                reference: data.reference || undefined
              };

              await this.cashRegisterService.addTransaction(request).toPromise();
              this.showToast('Transaction added successfully', 'success');
              this.refreshData();
            } catch (error) {
              console.error('Error adding transaction:', error);
              this.showToast('Error adding transaction', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async payToSupplier() {
    const alert = await this.alertCtrl.create({
      header: 'Pay to Supplier',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount',
          min: 0
        },
        {
          name: 'supplier',
          type: 'text',
          placeholder: 'Supplier name'
        },
        {
          name: 'reference',
          type: 'text',
          placeholder: 'Invoice/Reference number'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Pay',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount <= 0) {
              this.showToast('Invalid amount', 'danger');
              return false;
            }

            if (!data.supplier?.trim()) {
              this.showToast('Supplier name is required', 'danger');
              return false;
            }

            try {
              const request: CreateTransactionRequest = {
                cashRegisterId: this.currentRegister!.id,
                type: 'expense',
                amount,
                paymentMethod: 'cash',
                description: `Payment to supplier: ${data.supplier}`,
                reference: data.reference || undefined
              };

              await this.cashRegisterService.addTransaction(request).toPromise();
              this.showToast('Payment registered successfully', 'success');
              this.refreshData();
            } catch (error) {
              console.error('Error registering payment:', error);
              this.showToast('Error registering payment', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // ===== ORDER QUEUE OPERATIONS =====

  async callNextOrder() {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Calling next order...'
      });
      await loading.present();

      await this.cashRegisterService.callNextOrder().toPromise();
      await loading.dismiss();
      this.showToast('Next order called', 'success');
      this.refreshData();
    } catch (error) {
      console.error('Error calling next order:', error);
      this.showToast('Error calling next order', 'danger');
    }
  }

  async processOrder(order: OrderInQueue) {
    const alert = await this.alertCtrl.create({
      header: 'Process Order',
      message: `Mark order ${order.order.orderCode} as processed?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Process',
          handler: async () => {
            try {
              await this.cashRegisterService.processOrder(order.id).toPromise();
              this.showToast('Order processed successfully', 'success');
              this.refreshData();
            } catch (error) {
              console.error('Error processing order:', error);
              this.showToast('Error processing order', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // ===== FILTERING =====

  get filteredOrders(): OrderInQueue[] {
    let filtered = [...this.orderQueue];

    // Filter by type
    if (this.queueFilter !== 'all') {
      const typeMap: { [key: string]: string } = {
        'orders': 'order',
        'reservations': 'reservation'
      };
      const targetType = typeMap[this.queueFilter];
      if (targetType) {
        filtered = filtered.filter(order => order.order.type === targetType);
      }
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order.orderCode.toLowerCase().includes(term) ||
        order.order.customerName.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  onQueueFilterChange(event: any) {
    this.queueFilter = event.detail.value;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
  }

  // ===== UTILITIES =====

  refreshData() {
    this.loadInitialData();
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    this.showToast(
      `Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`,
      'primary'
    );
  }

  getRegisterStatusColor(): string {
    if (!this.currentRegister) return 'medium';
    return this.currentRegister.status === 'open' ? 'success' : 'medium';
  }

  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'waiting': 'warning',
      'called': 'primary',
      'processed': 'success',
      'pending': 'warning',
      'confirmed': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.color = color;
    toast.position = 'bottom';
    
    document.body.appendChild(toast);
    await toast.present();
  }

  // ===== COMPUTED PROPERTIES =====

  get hasOpenRegister(): boolean {
    return this.currentRegister?.status === 'open';
  }

  get canPerformOperations(): boolean {
    return this.hasOpenRegister && this.userPermissions.canProcessPayments;
  }

  // ===== TRACKBY FUNCTIONS =====

  trackByOrderId(index: number, order: OrderInQueue): string {
    return order.id;
  }
}