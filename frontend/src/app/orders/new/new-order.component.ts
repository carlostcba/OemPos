// src/app/orders/new/new-order.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { 
  AlertController, 
  LoadingController, 
  ModalController,
  ToastController 
} from '@ionic/angular';

import { ProductoService, Producto } from '../../productos/services/producto.service';
import { CategoriaService, Categoria } from '../../shared/services/categoria.service';
import { OrderService, Order, CreateOrderRequest } from '../services/order.service';
import { CartService, CartItem } from '../services/cart.service';
import { OrderConfirmationModal } from '../modals/order-confirmation.modal';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms - CORREGIDO: Usar aserción definitiva
  customerForm!: FormGroup;
  
  // Data
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  cartItems: CartItem[] = [];
  total = 0;
  
  // UI State
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  orderType: Order['type'] = 'orden';
  isPreorder = false;
  
  // Filters and pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private orderService: OrderService,
    private cartService: CartService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.subscribeToCart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.customerForm = this.fb.group({
      customer_name: ['', Validators.required],
      customer_phone: [''],
      customer_email: ['', Validators.email],
      table_number: [''],
      delivery_address: [''],
      delivery_date: [''],
      payment_method: ['cash', Validators.required],
      notes: ['']
    });

    // Configurar validaciones condicionales
    this.customerForm.get('order_type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.updateValidationsByType(type));
  }

  private async loadInitialData() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      const [productos, categorias] = await Promise.all([
        this.productoService.getAll().toPromise(),
        this.categoriaService.getCategorias().toPromise()
      ]);

      this.productos = productos?.filter(p => p.is_active) || [];
      this.categorias = categorias || [];
      this.applyFilters();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('Error al cargar los datos', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private subscribeToCart() {
    combineLatest([
      this.cartService.cartItems$,
      this.cartService.total$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([items, total]) => {
        this.cartItems = items;
        this.total = total;
      });
  }

  // Filtros y búsqueda
  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.productos];

    // Filtro por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category_id === this.selectedCategory);
    }

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.plu_code?.toLowerCase().includes(term)
      );
    }

    this.productosFiltrados = filtered;
    this.updatePagination();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.productosFiltrados.length / this.itemsPerPage);
  }

  get paginatedProducts(): Producto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.productosFiltrados.slice(start, end);
  }

  // Gestión del carrito
  async addToCart(product: Producto) {
    if (product.is_weighable) {
      await this.showQuantityModal(product);
    } else {
      this.cartService.addToCart(product, 1);
      this.showToast(`${product.name} agregado al carrito`);
    }
  }

  // CORREGIDO: Remover propiedad 'step' que no existe en AlertInput
  private async showQuantityModal(product: Producto) {
    const alert = await this.alertCtrl.create({
      header: product.name,
      subHeader: `$${product.price}/${product.unit_label}`,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          placeholder: product.is_weighable ? 'Peso en kg' : 'Cantidad',
          value: product.is_weighable ? '0.5' : '1',
          min: '0.001'
          // REMOVIDO: step no es una propiedad válida en AlertInput
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            const quantity = parseFloat(data.quantity);
            if (quantity > 0) {
              this.cartService.addToCart(product, quantity);
              this.showToast(`${product.name} agregado al carrito`);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  updateCartItemQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  // Gestión de tipos de orden
  onOrderTypeChange(type: Order['type']) {
    this.orderType = type;
    this.updateValidationsByType(type);
  }

  private updateValidationsByType(type: Order['type']) {
    const emailControl = this.customerForm.get('customer_email');
    const phoneControl = this.customerForm.get('customer_phone');
    const addressControl = this.customerForm.get('delivery_address');
    const tableControl = this.customerForm.get('table_number');
    const deliveryDateControl = this.customerForm.get('delivery_date');

    // Limpiar validaciones
    [emailControl, phoneControl, addressControl, tableControl, deliveryDateControl]
      .forEach(control => {
        control?.clearValidators();
        control?.updateValueAndValidity();
      });

    // Aplicar validaciones según tipo
    switch (type) {
      case 'pedido':
        emailControl?.setValidators([Validators.required, Validators.email]);
        phoneControl?.setValidators([Validators.required]);
        deliveryDateControl?.setValidators([Validators.required]);
        break;
      case 'delivery':
        phoneControl?.setValidators([Validators.required]);
        addressControl?.setValidators([Validators.required]);
        break;
      case 'salon':
        tableControl?.setValidators([Validators.required]);
        break;
    }

    // Actualizar validez
    [emailControl, phoneControl, addressControl, tableControl, deliveryDateControl]
      .forEach(control => control?.updateValueAndValidity());
  }

  // Cupones
  async applyCoupon() {
    const alert = await this.alertCtrl.create({
      header: 'Aplicar Cupón',
      inputs: [
        {
          name: 'couponCode',
          type: 'text',
          placeholder: 'Código del cupón'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: async (data) => {
            if (data.couponCode) {
              await this.validateCoupon(data.couponCode);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async validateCoupon(couponCode: string) {
    // TODO: Implementar validación de cupón
    // Por ahora solo mostrar mensaje
    this.showToast('Funcionalidad de cupones en desarrollo', 'warning');
  }

  // Crear orden
  async createOrder() {
    if (!this.validateOrder()) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: OrderConfirmationModal,
      componentProps: {
        orderData: this.buildOrderData(),
        cartItems: this.cartItems,
        total: this.total
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      await this.submitOrder();
    }
  }

  private validateOrder(): boolean {
    if (this.cartItems.length === 0) {
      this.showToast('Agregue al menos un producto', 'warning');
      return false;
    }

    if (this.customerForm.invalid) {
      this.showToast('Complete todos los campos requeridos', 'warning');
      return false;
    }

    return true;
  }

  private buildOrderData(): CreateOrderRequest {
    const formData = this.customerForm.value;
    
    return {
      type: this.orderType,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || undefined,
      customer_email: formData.customer_email || undefined,
      table_number: formData.table_number || undefined,
      delivery_address: formData.delivery_address || undefined,
      delivery_date: formData.delivery_date || undefined,
      payment_method: formData.payment_method,
      items: this.cartService.toOrderItems()
    };
  }

  private async submitOrder() {
    const loading = await this.loadingCtrl.create({
      message: 'Creando orden...'
    });
    await loading.present();

    try {
      const orderData = this.buildOrderData();
      const newOrder = await this.orderService.createOrder(orderData).toPromise();
      
      await loading.dismiss();
      
      this.showToast('Orden creada exitosamente', 'success');
      this.cartService.clearCart();
      this.customerForm.reset();
      
      // Navegar a la lista de órdenes o mostrar detalles
      this.router.navigate(['/orders', newOrder?.id]);
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creating order:', error);
      
      let message = 'Error al crear la orden';
      if (error.error?.error) {
        message = error.error.error;
      } else if (error.error?.message) {
        message = error.error.message;
      }
      
      this.showToast(message, 'danger');
    }
  }

  // Navegación
  goToOrders() {
    this.router.navigate(['/orders']);
  }

  // Utilities
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  // Getters para template
  get isDelivery(): boolean {
    return this.orderType === 'delivery';
  }

  get isSalon(): boolean {
    return this.orderType === 'salon';
  }

  get isPedido(): boolean {
    return this.orderType === 'pedido';
  }

  get hasCartItems(): boolean {
    return this.cartItems.length > 0;
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  formatQuantity(item: CartItem): string {
    if (item.product.is_weighable) {
      return item.quantity < 1 
        ? `${(item.quantity * 1000).toFixed(0)}g`
        : `${item.quantity.toFixed(3)}kg`;
    }
    return item.quantity.toString();
  }

  getOrderTypeLabel(type: Order['type']): string {
    const labels = {
      'orden': 'Orden',
      'pedido': 'Pedido',
      'delivery': 'Delivery',
      'salon': 'Salón'
    };
    return labels[type];
  }

  getOrderTypeColor(type: Order['type']): string {
    const colors = {
      'orden': 'primary',
      'pedido': 'success',
      'delivery': 'warning',
      'salon': 'secondary'
    };
    return colors[type];
  }
}