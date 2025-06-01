// src/app/orders/list/order-list.component.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonicModule, 
  IonContent,
  AlertController, 
  LoadingController,
  ModalController,
  ToastController,
  ActionSheetController,
  PopoverController
} from '@ionic/angular';
import { Subject, combineLatest, timer } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { OrderService, Order, OrderFilters } from '../services/order.service';
import { OrderQueueService } from '../services/order-queue.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderDetailsComponent } from '../details/order-details.component';
import { OrderSummaryModal } from '../modals/order-summary.modal';
import { OrderStatusPipe } from '../pipes/order-status.pipe';
import { OrderTypePipe } from '../pipes/order-type.pipe';

interface FilterOption {
  key: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule, 
    RouterModule,
    OrderDetailsComponent,
    OrderStatusPipe,
    OrderTypePipe
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  private destroy$ = new Subject<void>();

  // Estado principal
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  error: string | null = null;
  currentUser: any = null;

  // Filtros y búsqueda
  searchTerm = '';
  currentFilters: OrderFilters = {};
  activeFilter = 'today';
  
  // Opciones de filtro
  filterOptions: FilterOption[] = [
    { key: 'today', label: 'Hoy', icon: 'today-outline', color: 'primary' },
    { key: 'pending', label: 'Pendientes', icon: 'hourglass-outline', color: 'warning' },
    { key: 'confirmed', label: 'Confirmadas', icon: 'checkmark-circle-outline', color: 'success' },
    { key: 'all', label: 'Todas', icon: 'list-outline', color: 'medium' }
  ];

  // Configuración de vista
  viewMode: 'list' | 'grid' = 'list';
  sortBy: 'date' | 'status' | 'total' | 'customer' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  // Estados de UI
  refreshing = false;
  autoRefresh = true;
  refreshInterval = 30000; // 30 segundos

  constructor(
    private orderService: OrderService,
    private queueService: OrderQueueService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
    this.initializeComponent();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeComponent() {
    await this.loadCurrentUser();
    this.setupSearchDebounce();
    this.loadOrders();
  }

  private async loadCurrentUser() {
    try {
      this.currentUser = await this.authService.currentUser.pipe(
        takeUntil(this.destroy$)
      ).toPromise();
      
      console.log('👤 Usuario actual:', this.currentUser?.username);
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
    }
  }

  private setupSearchDebounce() {
    // Configurar búsqueda con debounce
    timer(0).pipe(
      switchMap(() => this.orderService.orders$),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(orders => {
      this.orders = orders;
      this.applyFilters();
    });
  }

   setupAutoRefresh() {
    if (this.autoRefresh) {
      timer(this.refreshInterval, this.refreshInterval).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.silentRefresh();
      });
    }
  }

  // === CARGA DE DATOS ===

  async loadOrders(showLoading = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;

    try {
      const filters = this.buildFilters();
      console.log('🔍 Cargando órdenes con filtros:', filters);

      await this.orderService.getOrders(filters).toPromise();
      
    } catch (error: any) {
      console.error('❌ Error cargando órdenes:', error);
      this.error = 'Error al cargar las órdenes: ' + (error.message || 'Error desconocido');
      await this.showToast('Error al cargar órdenes', 'danger');
    } finally {
      this.loading = false;
      this.refreshing = false;
    }
  }

  private buildFilters(): OrderFilters {
    const filters: OrderFilters = { ...this.currentFilters };

    // Aplicar filtro de fecha según la opción activa
    if (this.activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filters.startDate = today.toISOString();
      filters.endDate = tomorrow.toISOString();
    }

    // Aplicar filtros de estado
    if (this.activeFilter === 'pending') {
      filters.status = 'pendiente';
    } else if (this.activeFilter === 'confirmed') {
      filters.status = 'confirmado';
    }

    // Filtro de usuario (sellers solo ven sus órdenes)
    if (this.currentUser?.roles?.includes('seller')) {
      // El backend ya filtra por seller_id
    }

    return filters;
  }

  private applyFilters() {
    let filtered = [...this.orders];

    // Aplicar búsqueda por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_code.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_phone?.toLowerCase().includes(term) ||
        order.customer_email?.toLowerCase().includes(term)
      );
    }

    // Aplicar ordenamiento
    filtered = this.sortOrders(filtered);

    this.filteredOrders = filtered;
    this.totalItems = filtered.length;
  }

  private sortOrders(orders: Order[]): Order[] {
    return orders.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'total':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'customer':
          aValue = a.customer_name.toLowerCase();
          bValue = b.customer_name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // === EVENTOS DE UI ===

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.applyFilters();
  }

  onFilterChange(filterKey: string) {
    this.activeFilter = filterKey;
    this.loadOrders();
  }

  onSortChange(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy as any;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }

  async doRefresh(event: any) {
    this.refreshing = true;
    await this.loadOrders(false);
    event.target.complete();
  }

  private async silentRefresh() {
    if (!this.loading && !this.refreshing) {
      await this.loadOrders(false);
    }
  }

  // === ACCIONES DE ÓRDENES ===

  async openOrderDetails(order: Order) {
    const modal = await this.modalCtrl.create({
      component: OrderDetailsComponent,
      componentProps: {
        orderId: order.id,
        userRole: this.getUserRole()
      },
      cssClass: 'order-details-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.updated) {
      await this.loadOrders(false);
    }
  }

  async showOrderSummary(order: Order) {
    const modal = await this.modalCtrl.create({
      component: OrderSummaryModal,
      componentProps: {
        data: {
          order,
          includeQueue: true,
          showActions: this.canModifyOrder(order),
          title: `Resumen - ${order.order_code}`
        }
      },
      cssClass: 'order-summary-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.action !== 'cancelled') {
      await this.loadOrders(false);
      
      if (data?.action === 'queue_added') {
        await this.showToast(
          `Orden agregada a la cola. Posición: ${data.queuePosition}`,
          'success'
        );
      }
    }
  }

  async showOrderActions(order: Order, event: Event) {
    event.stopPropagation();

    const buttons = [];

    // Ver detalles
    buttons.push({
      text: 'Ver Detalles',
      icon: 'eye-outline',
      handler: () => this.openOrderDetails(order)
    });

    // Resumen
    buttons.push({
      text: 'Resumen',
      icon: 'document-text-outline',
      handler: () => this.showOrderSummary(order)
    });

    // Editar (solo sellers y órdenes modificables)
    if (this.canModifyOrder(order)) {
      buttons.push({
        text: 'Editar',
        icon: 'create-outline',
        handler: () => this.router.navigate(['/orders', order.id, 'edit'])
      });
    }

    // Agregar a cola
    if (this.canAddToQueue(order)) {
      buttons.push({
        text: 'Agregar a Cola',
        icon: 'people-outline',
        handler: () => this.addToQueue(order)
      });
    }

    // Cancelar
    if (this.canCancelOrder(order)) {
      buttons.push({
        text: 'Cancelar',
        icon: 'close-circle-outline',
        role: 'destructive',
        handler: () => this.cancelOrder(order)
      });
    }

    buttons.push({
      text: 'Cerrar',
      icon: 'close-outline',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Orden ${order.order_code}`,
      buttons
    });

    await actionSheet.present();
  }

  async addToQueue(order: Order) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Agregando a cola...'
      });
      await loading.present();

      const priority = this.getOrderPriority(order.type);
      const queueEntry = await this.queueService.addToQueue(order.id, priority).toPromise();

      await loading.dismiss();
      await this.showToast(
        `Orden agregada a la cola. Posición: ${queueEntry!.queue_position}`,
        'success'
      );

    } catch (error: any) {
      console.error('❌ Error agregando a cola:', error);
      await this.showToast('Error al agregar a la cola', 'danger');
    }
  }

  async cancelOrder(order: Order) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cancelación',
      message: `¿Está seguro que desea cancelar la orden ${order.order_code}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          handler: async () => {
            try {
              const loading = await this.loadingCtrl.create({
                message: 'Cancelando orden...'
              });
              await loading.present();

              await this.orderService.updateOrder(order.id, {
                status: 'cancelado'
              }).toPromise();

              await loading.dismiss();
              await this.showToast('Orden cancelada exitosamente', 'success');
              await this.loadOrders(false);

            } catch (error: any) {
              console.error('❌ Error cancelando orden:', error);
              await this.showToast('Error al cancelar la orden', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // === UTILIDADES ===

  private getUserRole(): 'seller' | 'cashier' {
    if (this.currentUser?.roles?.includes('seller') || this.currentUser?.roles?.includes('vendedor')) {
      return 'seller';
    }
    return 'cashier';
  }

  private canModifyOrder(order: Order): boolean {
    return this.orderService.canEditOrder(order, this.getUserRole());
  }

  private canCancelOrder(order: Order): boolean {
    return this.orderService.canCancelOrder(order, this.getUserRole());
  }

  private canAddToQueue(order: Order): boolean {
    return ['pendiente', 'confirmado'].includes(order.status);
  }

  private getOrderPriority(orderType: string): number {
    const priorities = {
      'salon': 3,
      'orden': 2,
      'pedido': 1,
      'delivery': 0
    };
    return priorities[orderType as keyof typeof priorities] || 1;
  }

  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.content.scrollToTop(300);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.content.scrollToTop(300);
    }
  }

  // === MÉTODOS DE UI ===

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  // === TRACKBY FUNCTIONS ===
  
  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  trackByFilterOption(index: number, option: FilterOption): string {
    return option.key;
  }
}