// src/app/orders/details/order-details.component.ts

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  ModalController, 
  AlertController, 
  LoadingController,
  ToastController 
} from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { OrderService, Order, OrderItem } from '../services/order.service';
import { ProductoService, Producto } from '../../productos/services/producto.service';
import { CategoriaService, Categoria } from '../../shared/services/categoria.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  @Input() orderId!: string;
  @Input() userRole: 'seller' | 'cashier' = 'cashier';

  private destroy$ = new Subject<void>();

  // Estado principal
  order: Order | null = null;
  tempItems: OrderItem[] = [];
  loading = true;
  saving = false;
  error: string | null = null;
  unsavedChanges = false;
  
  // Modal de selección de productos
  showProductSelector = false;
  products: Producto[] = [];
  filteredProducts: Producto[] = [];
  categories: Categoria[] = [];
  searchQuery = '';
  selectedCategory = '';
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 8;
  
  // Modal de cantidad para productos pesables
  showQuantityModal = false;
  selectedProduct: Producto | null = null;
  tempQuantity = '';

  constructor(
    private modalController: ModalController,
    private orderService: OrderService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.fetchOrderDetails();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetchOrderDetails() {
    this.loading = true;
    this.error = null;

    try {
      const order = await this.orderService.getOrderById(this.orderId)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      
      this.order = order!;
      this.tempItems = [...order!.items];
      this.unsavedChanges = false;
      
      console.log('✅ Orden cargada:', this.order);
    } catch (error: any) {
      console.error('❌ Error fetching order details:', error);
      this.error = 'Error al cargar los detalles de la orden';
      this.showToast('Error al cargar la orden', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async fetchProducts() {
    try {
      this.loading = true;
      
      // Cargar productos y categorías en paralelo
      const [products, categories] = await Promise.all([
        this.productoService.getAll().toPromise(),
        this.categoriaService.getCategorias().toPromise()
      ]);
      
      this.products = products?.filter(p => p.is_active) || [];
      this.categories = categories || [];
      this.filteredProducts = [...this.products];
      
      console.log('✅ Productos cargados:', this.products.length);
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      this.error = 'Error al cargar los productos';
      this.showToast('Error al cargar productos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  // === GESTIÓN DE ITEMS ===
  
  handleUpdateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.tempItems = this.tempItems.filter(i => i.id !== itemId);
    } else {
      this.tempItems = this.tempItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unit_price
            }
          : item
      );
    }
    this.unsavedChanges = true;
  }

  handleProductClick(product: Producto) {
    if (product.is_weighable) {
      this.selectedProduct = product;
      this.tempQuantity = '0.000';
      this.showQuantityModal = true;
    } else {
      this.handleAddProduct(product, 1);
    }
  }

  handleQuantityConfirm() {
    if (!this.selectedProduct) return;

    const quantity = parseFloat(this.tempQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      this.showToast('Cantidad inválida', 'warning');
      return;
    }

    this.handleAddProduct(this.selectedProduct, quantity);
    this.closeQuantityModal();
  }

  closeQuantityModal() {
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.tempQuantity = '';
  }

  async handleAddProduct(product: Producto, quantity: number = 1) {
    const existingItem = this.tempItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      this.handleUpdateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      const newItem: OrderItem = {
        id: `temp-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.price,
        final_price: product.price,
        subtotal: quantity * product.price,
        unit_label: product.unit_label,
        is_weighable: product.is_weighable,
        discount_applied: 0
      };
      this.tempItems = [...this.tempItems, newItem];
      this.unsavedChanges = true;
    }
    this.showProductSelector = false;
  }

  // === GUARDADO DE CAMBIOS ===
  
  async handleSaveChanges() {
    if (!this.order) return;

    this.saving = true;
    this.error = null;

    const loading = await this.loadingCtrl.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Preparar datos para el backend
      const updateData = {
        items: this.tempItems.map(item => ({
          id: item.id.startsWith('temp-') ? undefined : item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          final_price: item.final_price,
          subtotal: item.subtotal,
          unit_label: item.unit_label,
          is_weighable: item.is_weighable,
          discount_applied: item.discount_applied || 0
        })),
        total_amount: this.totalAmount,
        replaceItems: true
      };

      console.log('💾 Guardando cambios:', updateData);

      const updatedOrder = await this.orderService.updateOrder(this.order.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      
      this.order = updatedOrder!;
      this.tempItems = [...updatedOrder!.items];
      this.unsavedChanges = false;

      await this.showToast('Cambios guardados exitosamente', 'success');
      
    } catch (error: any) {
      console.error('❌ Error saving changes:', error);
      this.error = 'Error al guardar los cambios: ' + (error.message || 'Error desconocido');
      await this.showToast('Error al guardar cambios', 'danger');
    } finally {
      this.saving = false;
      await loading.dismiss();
    }
  }

  // === FILTROS Y BÚSQUEDA ===
  
  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category_id === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.plu_code?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
    // Reset pagination
    this.currentPage = 1;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.filterProducts();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterProducts();
  }

  // === PAGINACIÓN ===
  
  get paginatedProducts(): Producto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // === UTILIDADES ===
  
  formatQuantity(item: OrderItem): string {
    if (!item.is_weighable) {
      return item.quantity.toString();
    }
    return item.quantity < 1 
      ? `${(item.quantity * 1000).toFixed(0)}g`
      : `${item.quantity.toFixed(3)}kg`;
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async handleClose() {
    if (this.unsavedChanges) {
      const alert = await this.alertCtrl.create({
        header: 'Cambios sin guardar',
        message: 'Hay cambios sin guardar. ¿Desea descartarlos?',
        buttons: [
          {
            text: 'No, mantener cambios',
            role: 'cancel'
          },
          {
            text: 'Sí, descartar cambios',
            handler: () => {
              this.modalController.dismiss();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.modalController.dismiss();
    }
  }

  async openProductSelector() {
    this.showProductSelector = true;
    await this.fetchProducts();
  }

  closeProductSelector() {
    this.showProductSelector = false;
    this.searchQuery = '';
    this.selectedCategory = '';
  }

  // === GETTERS PARA TEMPLATE ===
  
  get isEditable(): boolean {
    return this.userRole === 'seller' && this.order?.status !== 'cancelado';
  }

  get totalAmount(): number {
    return this.tempItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get orderStatusColor(): string {
    switch (this.order?.status) {
      case 'pendiente': return 'warning';
      case 'confirmado': return 'primary';
      case 'entregado': return 'success';
      case 'cancelado': return 'danger';
      default: return 'medium';
    }
  }

  get orderStatusText(): string {
    switch (this.order?.status) {
      case 'pendiente': return 'Pendiente';
      case 'confirmado': return 'Confirmado';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  get orderTypeIcon(): string {
    switch (this.order?.type) {
      case 'orden': return 'receipt-outline';
      case 'pedido': return 'time-outline';
      case 'delivery': return 'car-outline';
      case 'salon': return 'restaurant-outline';
      default: return 'document-outline';
    }
  }

  get orderTypeText(): string {
    switch (this.order?.type) {
      case 'orden': return 'Orden';
      case 'pedido': return 'Pedido';
      case 'delivery': return 'Delivery';
      case 'salon': return 'Salón';
      default: return 'Desconocido';
    }
  }
   // === MÉTODOS TRACKBY PARA OPTIMIZAR *ngFor ===

  trackByItemId(index: number, item: OrderItem): string {
    return item.id;
  }

  trackByCategoryId(index: number, category: Categoria): string {
    return category.id;
  }

  trackByProductId(index: number, product: Producto): string {
    return product.id;
  }

  // === WRAPPER PARA parseFloat USADO EN LA PLANTILLA ===

  parseFloat(value: any): number {
    return Number.parseFloat(value);
  }
}