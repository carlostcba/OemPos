// frontend/src/app/pedidos/pedidos-lista/pedidos-lista.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

// ✅ Usar servicios propios del módulo pedidos
import { PedidosService, Pedido, PedidoFilters } from '../services/pedidos.service';
import { AuthService } from '../../core/services/auth.service';

// ✅ Usar pipes propios del módulo pedidos (SIN CurrencyPipe)
import { PedidoTypePipe, PedidoStatusPipe, TimeAgoPipe } from '../pipes/pedidos-format.pipes';

// ✅ Usar componente propio del módulo pedidos
import { PedidoDetailsComponent } from '../components/pedidos-details.component';

interface FilterOption {
  key: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule,
    PedidoDetailsComponent,
    PedidoTypePipe,
    PedidoStatusPipe,
    TimeAgoPipe
    // ✅ REMOVIDO: CurrencyPipe (usar el nativo de Angular con | currency)
  ],
  templateUrl: './pedidos-lista.component.html',
  styleUrls: ['./pedidos-lista.component.scss']
})
export class PedidosListaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado
  pedidos: Pedido[] = [];
  filteredPedidos: Pedido[] = [];
  loading = false;
  error: string | null = null;
  currentUser: any = null;

  // Filtros
  selectedType: 'all' | 'orden' | 'pedido' | 'delivery' | 'salon' = 'all';
  selectedStatus = 'all';
  dateFilter: 'today' | 'all' | 'custom' = 'today';
  customDate = '';
  searchTerm = '';

  // UI State
  refreshing = false;
  autoRefresh = true;

  // Opciones de filtro
  typeFilters: FilterOption[] = [
    { key: 'all', label: 'Todas', color: 'medium' },
    { key: 'orden', label: 'Órdenes', color: 'primary' },
    { key: 'pedido', label: 'Pedidos', color: 'success' },
    { key: 'delivery', label: 'Delivery', color: 'warning' },
    { key: 'salon', label: 'Salón', color: 'secondary' }
  ];

  statusFilters: FilterOption[] = [
    { key: 'all', label: 'Todos', color: 'medium' },
    { key: 'pendiente', label: 'Pendientes', color: 'warning' },
    { key: 'confirmado', label: 'Confirmados', color: 'primary' },
    { key: 'esperando_retiro', label: 'Esperando Retiro', color: 'secondary' },
    { key: 'entregado', label: 'Entregados', color: 'success' },
    { key: 'cancelado', label: 'Cancelados', color: 'danger' }
  ];

  constructor(
    private pedidosService: PedidosService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadPedidos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // === INICIALIZACIÓN ===

  private loadCurrentUser() {
    this.authService.currentUser.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      console.log('👤 Usuario actual:', user);
    });
  }

  // === CARGA DE DATOS ===

  loadPedidos(showLoading = true) {
    if (showLoading) {
      this.loading = true;
    }
    this.error = null;

    const filters = this.buildFilters();
    
    this.pedidosService.getAll(filters).subscribe({
      next: (pedidos) => {
        console.log('📦 Pedidos cargados:', pedidos);
        this.pedidos = pedidos || [];
        this.applyClientFilters();
        this.loading = false;
        this.refreshing = false;
      },
      error: (error) => {
        console.error('❌ Error cargando pedidos:', error);
        this.error = 'Error al cargar los pedidos';
        this.showToast('Error al cargar pedidos', 'danger');
        this.loading = false;
        this.refreshing = false;
      }
    });
  }

  private buildFilters(): PedidoFilters {
    const filters: PedidoFilters = {};

    if (this.dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filters.startDate = today.toISOString();
      filters.endDate = tomorrow.toISOString();
    } else if (this.dateFilter === 'custom' && this.customDate) {
      const selectedDate = new Date(this.customDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filters.startDate = selectedDate.toISOString();
      filters.endDate = nextDay.toISOString();
    }

    return filters;
  }

  private applyClientFilters() {
    let filtered = [...this.pedidos];

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(pedido => pedido.type === this.selectedType);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(pedido => pedido.status === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pedido =>
        pedido.order_code?.toLowerCase().includes(term) ||
        pedido.customer_name?.toLowerCase().includes(term) ||
        pedido.customer_phone?.toLowerCase().includes(term) ||
        pedido.customer_email?.toLowerCase().includes(term)
      );
    }

    this.filteredPedidos = filtered;
    console.log('🔍 Pedidos filtrados:', this.filteredPedidos.length);
  }

  // === EVENTOS DE UI ===

  onFilterChange() {
    this.applyClientFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.applyClientFilters();
  }

  onDateFilterChange() {
    this.loadPedidos();
  }

  async doRefresh(event: any) {
    this.refreshing = true;
    this.loadPedidos(false);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    this.showToast(`Auto-refresh ${this.autoRefresh ? 'activado' : 'desactivado'}`, 'primary');
  }

  // === ACCIONES DE PEDIDOS ===

  async openPedidoDetails(pedido: Pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoDetailsComponent,
      componentProps: {
        pedidoId: pedido.id,
        userRole: this.getUserRole()
      },
      cssClass: 'pedido-details-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.updated) {
      this.loadPedidos(false);
    }
  }

  async cancelPedido(pedido: Pedido) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Cancelación',
      message: `¿Está seguro que desea cancelar el pedido ${pedido.order_code}?`,
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
                message: 'Cancelando pedido...'
              });
              await loading.present();

              this.pedidosService.update(pedido.id, { status: 'cancelado' }).subscribe({
                next: async () => {
                  await loading.dismiss();
                  await this.showToast('Pedido cancelado exitosamente', 'success');
                  this.loadPedidos(false);
                },
                error: async (error) => {
                  await loading.dismiss();
                  console.error('❌ Error cancelando pedido:', error);
                  await this.showToast('Error al cancelar el pedido', 'danger');
                }
              });

            } catch (error: any) {
              console.error('❌ Error cancelando pedido:', error);
              await this.showToast('Error al cancelar el pedido', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmPedido(pedido: Pedido) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Pedido',
      message: `¿Desea confirmar el pedido ${pedido.order_code}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              const loading = await this.loadingCtrl.create({
                message: 'Confirmando pedido...'
              });
              await loading.present();

              this.pedidosService.update(pedido.id, { status: 'confirmado' }).subscribe({
                next: async () => {
                  await loading.dismiss();
                  await this.showToast('Pedido confirmado exitosamente', 'success');
                  this.loadPedidos(false);
                },
                error: async (error) => {
                  await loading.dismiss();
                  console.error('❌ Error confirmando pedido:', error);
                  await this.showToast('Error al confirmar el pedido', 'danger');
                }
              });

            } catch (error: any) {
              console.error('❌ Error confirmando pedido:', error);
              await this.showToast('Error al confirmar el pedido', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async markAsDelivered(pedido: Pedido) {
    const alert = await this.alertCtrl.create({
      header: 'Marcar como Entregado',
      message: `¿Confirma que el pedido ${pedido.order_code} fue entregado?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, Entregado',
          handler: async () => {
            try {
              const loading = await this.loadingCtrl.create({
                message: 'Marcando como entregado...'
              });
              await loading.present();

              this.pedidosService.update(pedido.id, { status: 'entregado' }).subscribe({
                next: async () => {
                  await loading.dismiss();
                  await this.showToast('Pedido marcado como entregado', 'success');
                  this.loadPedidos(false);
                },
                error: async (error) => {
                  await loading.dismiss();
                  console.error('❌ Error marcando como entregado:', error);
                  await this.showToast('Error al marcar como entregado', 'danger');
                }
              });

            } catch (error: any) {
              console.error('❌ Error marcando como entregado:', error);
              await this.showToast('Error al marcar como entregado', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // === MÉTODOS DE COLOR PARA UI ===

  getStatusColor(status: string): string {
    const colors = {
      'pendiente': 'warning',
      'confirmado': 'primary', 
      'esperando_retiro': 'secondary',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return colors[status as keyof typeof colors] || 'medium';
  }

  getTypeColor(type: string): string {
    const colors = {
      'orden': 'primary',
      'pedido': 'success', 
      'delivery': 'warning',
      'salon': 'secondary'
    };
    return colors[type as keyof typeof colors] || 'medium';
  }

  // === CÁLCULOS ===

  getTotalAmount(): number {
    return this.filteredPedidos.reduce((total, pedido) => {
      return total + (pedido.total_amount || 0);
    }, 0);
  }

  getPedidosCount(): number {
    return this.filteredPedidos.length;
  }

  getStatusStats() {
    const stats = {
      pendiente: 0,
      confirmado: 0,
      esperando_retiro: 0,
      entregado: 0,
      cancelado: 0,
      total: this.filteredPedidos.length
    };

    this.filteredPedidos.forEach(pedido => {
      if (stats.hasOwnProperty(pedido.status)) {
        (stats as any)[pedido.status]++;
      }
    });

    return stats;
  }

  // === VALIDACIONES ===

  private getUserRole(): 'seller' | 'cashier' {
    if (this.currentUser?.roles?.includes('vendedor') || 
        this.currentUser?.roles?.includes('seller')) {
      return 'seller';
    }
    return 'cashier';
  }

  canEditPedido(pedido: Pedido): boolean {
    return pedido.status !== 'cancelado' && 
           pedido.status !== 'entregado';
  }

  canCancelPedido(pedido: Pedido): boolean {
    return pedido.status !== 'cancelado' && 
           pedido.status !== 'entregado';
  }

  canConfirmPedido(pedido: Pedido): boolean {
    return pedido.status === 'pendiente';
  }

  canMarkAsDelivered(pedido: Pedido): boolean {
    return pedido.status === 'confirmado' || 
           pedido.status === 'esperando_retiro';
  }

  // === FORMATO ===

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // === FILTROS AVANZADOS ===

  clearAllFilters() {
    this.selectedType = 'all';
    this.selectedStatus = 'all';
    this.dateFilter = 'today';
    this.searchTerm = '';
    this.customDate = '';
    this.loadPedidos();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedType !== 'all') count++;
    if (this.selectedStatus !== 'all') count++;
    if (this.dateFilter !== 'today') count++;
    if (this.searchTerm.trim()) count++;
    return count;
  }

  // === UTILIDADES ===

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.color = color;
    toast.position = 'bottom';
    
    document.body.appendChild(toast);
    await toast.present();
  }

  // === TRACKBY FUNCTIONS ===
  
  trackByPedidoId(index: number, pedido: Pedido): string {
    return pedido.id;
  }

  trackByFilterOption(index: number, option: FilterOption): string {
    return option.key;
  }
}