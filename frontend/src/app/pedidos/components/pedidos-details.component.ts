// frontend/src/app/pedidos/components/pedidos-details.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { PedidosService, Pedido } from '../services/pedidos.service';
import { PedidoTypePipe, PedidoStatusPipe, TimeAgoPipe } from '../pipes/pedidos-format.pipes';

@Component({
  selector: 'app-pedido-details',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PedidoTypePipe,
    PedidoStatusPipe,
    TimeAgoPipe
    // ✅ REMOVIDO: CurrencyPipe (usar el nativo de Angular)
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Detalles del Pedido</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="closeModal()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando detalles...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <ion-icon name="alert-circle" color="danger"></ion-icon>
        <p>{{ error }}</p>
        <ion-button fill="outline" (click)="loadPedidoDetails()">Reintentar</ion-button>
      </div>

      <div *ngIf="pedido && !loading" class="pedido-details">
        <!-- Header -->
        <ion-card>
          <ion-card-header>
            <div class="pedido-header">
              <div>
                <ion-card-title>{{ pedido.order_code }}</ion-card-title>
                <ion-card-subtitle>{{ pedido.type | pedidoType }}</ion-card-subtitle>
              </div>
              <ion-badge [color]="getStatusColor(pedido.status)">
                {{ pedido.status | pedidoStatus }}
              </ion-badge>
            </div>
          </ion-card-header>
        </ion-card>

        <!-- Customer Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Información del Cliente</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="person" slot="start"></ion-icon>
                <ion-label>
                  <h3>Nombre</h3>
                  <p>{{ pedido.customer_name || 'No especificado' }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.customer_phone">
                <ion-icon name="call" slot="start"></ion-icon>
                <ion-label>
                  <h3>Teléfono</h3>
                  <p>{{ pedido.customer_phone }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.customer_email">
                <ion-icon name="mail" slot="start"></ion-icon>
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ pedido.customer_email }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.table_number">
                <ion-icon name="restaurant" slot="start"></ion-icon>
                <ion-label>
                  <h3>Mesa</h3>
                  <p>{{ pedido.table_number }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.delivery_address">
                <ion-icon name="location" slot="start"></ion-icon>
                <ion-label>
                  <h3>Dirección</h3>
                  <p>{{ pedido.delivery_address }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Pedido Items -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Productos</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list *ngIf="pedido.items && pedido.items.length > 0">
              <ion-item *ngFor="let item of pedido.items">
                <ion-label>
                  <h3>{{ item.product_name }}</h3>
                  <p>{{ item.quantity }} {{ item.unit_label }} × {{ item.unit_price | currency:'ARS':'symbol':'1.2-2':'es-AR' }}</p>
                </ion-label>
                <ion-note slot="end" color="primary">
                  {{ item.subtotal | currency:'ARS':'symbol':'1.2-2':'es-AR' }}
                </ion-note>
              </ion-item>
            </ion-list>
            <div *ngIf="!pedido.items || pedido.items.length === 0" class="no-items">
              <ion-icon name="cube-outline" size="large"></ion-icon>
              <p>No hay productos en este pedido</p>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Payment Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Información de Pago</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h3>Subtotal</h3>
                </ion-label>
                <ion-note slot="end">{{ pedido.total_amount | currency:'ARS':'symbol':'1.2-2':'es-AR' }}</ion-note>
              </ion-item>
              
              <ion-item *ngIf="pedido.discount_amount && pedido.discount_amount > 0">
                <ion-label>
                  <h3>Descuento</h3>
                </ion-label>
                <ion-note slot="end" color="success">
                  -{{ pedido.discount_amount | currency:'ARS':'symbol':'1.2-2':'es-AR' }}
                </ion-note>
              </ion-item>
              
              <ion-item>
                <ion-label>
                  <h2><strong>Total</strong></h2>
                </ion-label>
                <ion-note slot="end" color="primary">
                  <strong>{{ getFinalTotal() | currency:'ARS':'symbol':'1.2-2':'es-AR' }}</strong>
                </ion-note>
              </ion-item>
              
              <ion-item *ngIf="pedido.payment_method">
                <ion-label>
                  <h3>Método de Pago</h3>
                </ion-label>
                <ion-note slot="end">{{ pedido.payment_method }}</ion-note>
              </ion-item>
              
              <ion-item *ngIf="pedido.deposit_amount && pedido.deposit_amount > 0">
                <ion-label>
                  <h3>Seña Pagada</h3>
                </ion-label>
                <ion-note slot="end" color="success">
                  {{ pedido.deposit_amount | currency:'ARS':'symbol':'1.2-2':'es-AR' }}
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Timestamps -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Fechas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon name="calendar" slot="start"></ion-icon>
                <ion-label>
                  <h3>Creado</h3>
                  <p>{{ pedido.created_at | timeAgo }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.updated_at">
                <ion-icon name="sync" slot="start"></ion-icon>
                <ion-label>
                  <h3>Última Actualización</h3>
                  <p>{{ pedido.updated_at | timeAgo }}</p>
                </ion-label>
              </ion-item>
              
              <ion-item *ngIf="pedido.delivery_date">
                <ion-icon name="truck" slot="start"></ion-icon>
                <ion-label>
                  <h3>Fecha de Entrega</h3>
                  <p>{{ pedido.delivery_date | timeAgo }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <div class="actions" *ngIf="canPerformActions()">
          <ion-button 
            *ngIf="canConfirmPedido()"
            expand="block" 
            color="primary"
            (click)="confirmPedido()">
            <ion-icon name="checkmark-circle" slot="start"></ion-icon>
            Confirmar Pedido
          </ion-button>
          
          <ion-button 
            *ngIf="canCancelPedido()"
            expand="block" 
            color="danger" 
            fill="outline"
            (click)="cancelPedido()">
            <ion-icon name="close-circle" slot="start"></ion-icon>
            Cancelar Pedido
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 16px;
    }

    .pedido-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .no-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: var(--ion-color-medium);
      text-align: center;
    }

    .no-items ion-icon {
      margin-bottom: 16px;
    }

    .actions {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    ion-card {
      margin-bottom: 16px;
    }
  `]
})
export class PedidoDetailsComponent implements OnInit {
  @Input() pedidoId!: string;
  @Input() userRole: 'seller' | 'cashier' = 'seller';

  pedido: Pedido | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private pedidosService: PedidosService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    if (this.pedidoId) {
      this.loadPedidoDetails();
    } else {
      this.error = 'ID de pedido no válido';
      this.loading = false;
    }
  }

  async loadPedidoDetails() {
    this.loading = true;
    this.error = null;

    try {
      const result = await this.pedidosService.getById(this.pedidoId).toPromise();
      this.pedido = result || null;
    } catch (error: any) {
      console.error('❌ Error loading pedido details:', error);
      this.error = 'Error al cargar los detalles del pedido';
    } finally {
      this.loading = false;
    }
  }

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

  getFinalTotal(): number {
    if (!this.pedido) return 0;
    return this.pedido.total_amount - (this.pedido.discount_amount || 0);
  }

  canPerformActions(): boolean {
    return this.pedido?.status !== 'entregado' && this.pedido?.status !== 'cancelado';
  }

  canConfirmPedido(): boolean {
    return this.userRole === 'cashier' && 
           this.pedido?.status === 'pendiente';
  }

  canCancelPedido(): boolean {
    return ['pendiente', 'confirmado'].includes(this.pedido?.status || '');
  }

  async confirmPedido() {
    if (!this.pedido) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Pedido',
      message: `¿Desea confirmar el pedido ${this.pedido.order_code}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.updatePedidoStatus('confirmado');
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelPedido() {
    if (!this.pedido) return;

    const alert = await this.alertCtrl.create({
      header: 'Cancelar Pedido',
      message: `¿Está seguro que desea cancelar el pedido ${this.pedido.order_code}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, Cancelar',
          handler: async () => {
            await this.updatePedidoStatus('cancelado');
          }
        }
      ]
    });

    await alert.present();
  }

  private async updatePedidoStatus(status: Pedido['status']) {
    if (!this.pedido) return;

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando pedido...'
    });
    await loading.present();

    try {
      const result = await this.pedidosService.update(this.pedido.id, { status }).toPromise();
      this.pedido = result || null;
      await this.showToast('Pedido actualizado exitosamente', 'success');
      this.closeModal(true);
    } catch (error) {
      console.error('❌ Error updating pedido:', error);
      await this.showToast('Error al actualizar el pedido', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.color = color;
    toast.position = 'bottom';
    
    document.body.appendChild(toast);
    await toast.present();
  }

  closeModal(updated = false) {
    this.modalCtrl.dismiss({ updated });
  }
}