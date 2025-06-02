// src/app/orders/create/create-order.component.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonicModule, 
  IonContent,
  AlertController, 
  LoadingController,
  ModalController,
  ToastController,
  ActionSheetController 
} from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { OrderService, CreateOrderRequest, OrderItem } from '../services/order.service';
import { ProductoService, Producto } from '../../productos/services/producto.service';
import { CategoriaService, Categoria } from '../../shared/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponModal } from '../modals/coupon.modal';
import { OrderSummaryModal } from '../modals/order-summary.modal';

type OrderType = 'orden' | 'pedido' | 'delivery' | 'salon';
type PaymentMethod = 'cash' | 'credit' | 'transfer';

interface CartItem extends OrderItem {
  tempId: string;
  product: Producto;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  private destroy$ = new Subject<void>();

  // Forms
  orderForm!: FormGroup;
  customerForm!: FormGroup;

  // Estado principal
  cartItems: CartItem[] = [];
  currentUser: any = null;
  loading = false;
  saving = false;
  error: string | null = null;

  // Productos y categorías
  products: Producto[] = [];
  categories: Categoria[] = [];
  filteredProducts: Producto[] = [];
  
  // Filtros de productos
  searchQuery = '';
  selectedCategory = '';
  
  // Paginación de productos
  currentPage = 1;
  itemsPerPage = 12;

  // Modal de cantidad para productos pesables
  showQuantityModal = false;
  selectedProduct: Producto | null = null;
  tempQuantity = '';

  // Cupón aplicado
  appliedCoupon: any = null;
  discountAmount = 0;

  // Configuraciones de la orden
  orderTypes = [
    { key: 'orden', label: 'Orden', icon: 'receipt-outline', description: 'Compra directa en mostrador' },
    { key: 'pedido', label: 'Pedido', icon: 'time-outline', description: 'Pedido anticipado con fecha de entrega' },
    { key: 'delivery', label: 'Delivery', icon: 'car-outline', description: 'Entrega a domicilio' },
    { key: 'salon', label: 'Salón', icon: 'restaurant-outline', description: 'Consumo en local' }
  ];

  paymentMethods = [
    { key: 'cash', label: 'Efectivo', icon: 'cash-outline' },
    { key: 'credit', label: 'Tarjeta', icon: 'card-outline' },
    { key: 'transfer', label: 'Transferencia', icon: 'swap-horizontal-outline' }
  ];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadProducts();
    this.loadCategories();
    this.setupFormWatchers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    this.orderForm = this.fb.group({
      type: ['orden', Validators.required],
      payment_method: ['cash', Validators.required],
      table_number: [''],
      delivery_address: [''],
      delivery_date: [''],
      deposit_amount: [0, [Validators.min(0)]]
    });

    this.customerForm = this.fb.group({
      customer_name: ['', Validators.required],
      customer_phone: [''],
      customer_email: ['', Validators.email]
    });
  }

  private async loadCurrentUser() {
    try {
      this.currentUser = await this.authService.currentUser.pipe(
        takeUntil(this.destroy$)
      ).toPromise();
      
      console.log('👤 Usuario actual:', this.currentUser?.username);
    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      this.router.navigate(['/login']);
    }
  }

  private async loadProducts() {
    try {
      this.loading = true;
      const products = await this.productoService.getAll().toPromise();
      this.products = products?.filter(p => p.is_active) || [];
      this.filteredProducts = [...this.products];
      console.log('✅ Productos cargados:', this.products.length);
    } catch (error: any) {
      console.error('❌ Error cargando productos:', error);
      this.error = 'Error al cargar productos';
      await this.showToast('Error al cargar productos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private async loadCategories() {
    try {
      const categories = await this.categoriaService.getCategorias().toPromise();
      this.categories = categories || [];
      console.log('✅ Categorías cargadas:', this.categories.length);
    } catch (error: any) {
      console.error('❌ Error cargando categorías:', error);
    }
  }

  private setupFormWatchers() {
    // Watcher para tipo de orden
    this.orderForm.get('type')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(type => {
      this.onOrderTypeChange(type);
    });

    // Validaciones dinámicas
    this.setupDynamicValidations();
  }

  private setupDynamicValidations() {
    const typeControl = this.orderForm.get('type');
    const deliveryAddressControl = this.orderForm.get('delivery_address');
    const deliveryDateControl = this.orderForm.get('delivery_date');
    const tableNumberControl = this.orderForm.get('table_number');
    const customerEmailControl = this.customerForm.get('customer_email');
    const customerPhoneControl = this.customerForm.get('customer_phone');

    typeControl?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(type => {
      // Limpiar validaciones previas
      deliveryAddressControl?.clearValidators();
      deliveryDateControl?.clearValidators();
      tableNumberControl?.clearValidators();
      customerEmailControl?.clearValidators();
      customerPhoneControl?.clearValidators();

      // Aplicar validaciones según el tipo
      switch (type) {
        case 'delivery':
          deliveryAddressControl?.setValidators([Validators.required]);
          customerPhoneControl?.setValidators([Validators.required]);
          break;
        case 'salon':
          tableNumberControl?.setValidators([Validators.required]);
          break;
        case 'pedido':
          deliveryDateControl?.setValidators([Validators.required]);
          customerEmailControl?.setValidators([Validators.required, Validators.email]);
          customerPhoneControl?.setValidators([Validators.required]);
          break;
      }

      // Actualizar validación
      deliveryAddressControl?.updateValueAndValidity();
      deliveryDateControl?.updateValueAndValidity();
      tableNumberControl?.updateValueAndValidity();
      customerEmailControl?.updateValueAndValidity();
      customerPhoneControl?.updateValueAndValidity();
    });
  }

  // === GESTIÓN DE PRODUCTOS ===

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category_id === this.selectedCategory;
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.plu_code?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
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

  get paginatedProducts(): Producto[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // === GESTIÓN DEL CARRITO ===

  async addToCart(product: Producto) {
    if (product.is_weighable) {
      this.selectedProduct = product;
      this.tempQuantity = '0.000';
      this.showQuantityModal = true;
    } else {
      this.addItemToCart(product, 1);
    }
  }

  async addItemToCart(product: Producto, quantity: number) {
    const existingItem = this.cartItems.find(item => item.product_id === product.id);

    if (existingItem) {
      this.updateCartItemQuantity(existingItem.tempId, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        tempId: `temp-${Date.now()}-${Math.random()}`,
        id: '',
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        unit_price: product.price,
        final_price: product.price,
        subtotal: quantity * product.price,
        unit_label: product.unit_label,
        is_weighable: product.is_weighable,
        discount_applied: 0,
        product: product
      };

      this.cartItems.push(newItem);
    }

    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.tempQuantity = '';
    
    await this.showToast(`${product.name} agregado al carrito`, 'success');
  }

  updateCartItemQuantity(tempId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeFromCart(tempId);
      return;
    }

    const itemIndex = this.cartItems.findIndex(item => item.tempId === tempId);
    if (itemIndex !== -1) {
      const item = this.cartItems[itemIndex];
      item.quantity = newQuantity;
      item.subtotal = newQuantity * item.final_price;
    }
  }

  removeFromCart(tempId: string) {
    this.cartItems = this.cartItems.filter(item => item.tempId !== tempId);
  }

  async clearCart() {
    if (this.cartItems.length === 0) return;

    const alert = await this.alertCtrl.create({
      header: 'Limpiar Carrito',
      message: '¿Está seguro que desea eliminar todos los productos del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, limpiar',
          handler: () => {
            this.cartItems = [];
            this.appliedCoupon = null;
            this.discountAmount = 0;
          }
        }
      ]
    });

    await alert.present();
  }

  // === GESTIÓN DE CUPONES ===

  async openCouponModal() {
    if (this.getSubtotal() === 0) {
      await this.showToast('Agregue productos antes de aplicar un cupón', 'warning');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: CouponModal,
      componentProps: {
        orderTotal: this.getSubtotal(),
        orderId: '', // No hay orden creada aún
        currentPaymentMethod: this.orderForm.get('payment_method')?.value
      }
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.applied) {
      this.appliedCoupon = {
        code: data.couponCode,
        discountAmount: data.discountAmount
      };
      this.discountAmount = data.discountAmount;
      
      // Actualizar método de pago si es necesario
      if (data.paymentMethod) {
        this.orderForm.patchValue({ payment_method: data.paymentMethod });
      }
      
      await this.showToast('Cupón aplicado exitosamente', 'success');
    }
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.discountAmount = 0;
  }

  // === CÁLCULOS ===

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getTotalDiscount(): number {
    return this.discountAmount;
  }

  getFinalTotal(): number {
    return Math.max(0, this.getSubtotal() - this.getTotalDiscount());
  }

  // === EVENTOS DE FORMULARIO ===

  onOrderTypeChange(type: OrderType) {
    // Limpiar campos que no aplican al tipo seleccionado
    if (type !== 'delivery') {
      this.orderForm.patchValue({ delivery_address: '' });
    }
    if (type !== 'salon') {
      this.orderForm.patchValue({ table_number: '' });
    }
    if (type !== 'pedido') {
      this.orderForm.patchValue({ 
        delivery_date: '',
        deposit_amount: 0
      });
    }
  }

  async onQuantityConfirm() {
    if (!this.selectedProduct) return;

    const quantity = parseFloat(this.tempQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      await this.showToast('Cantidad inválida', 'warning');
      return;
    }

    this.addItemToCart(this.selectedProduct, quantity);
  }

  closeQuantityModal() {
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.tempQuantity = '';
  }

  // === CREACIÓN DE ORDEN ===

  async createOrder() {
    if (!this.validateOrder()) {
      return;
    }

    this.saving = true;
    
    const loading = await this.loadingCtrl.create({
      message: 'Creando orden...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const orderData = this.buildOrderRequest();
      console.log('🚀 Creando orden:', orderData);

      const createdOrder = await this.orderService.createOrder(orderData).toPromise();
      
      await loading.dismiss();
      
      // Mostrar resumen de la orden creada
      await this.showOrderSummary(createdOrder!);
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error creando orden:', error);
      this.error = 'Error al crear la orden: ' + (error.message || 'Error desconocido');
      await this.showToast('Error al crear la orden', 'danger');
    } finally {
      this.saving = false;
    }
  }

  private validateOrder(): boolean {
    if (this.cartItems.length === 0) {
      this.showToast('Agregue al menos un producto', 'warning');
      return false;
    }

    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      this.showToast('Complete los datos del cliente', 'warning');
      return false;
    }

    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm);
      this.showToast('Complete los datos de la orden', 'warning');
      return false;
    }

    return true;
  }

  private buildOrderRequest(): CreateOrderRequest {
    const formValues = { ...this.orderForm.value, ...this.customerForm.value };
    
    return {
      type: formValues.type,
      customer_name: formValues.customer_name,
      customer_phone: formValues.customer_phone || undefined,
      customer_email: formValues.customer_email || undefined,
      table_number: formValues.table_number || undefined,
      delivery_address: formValues.delivery_address || undefined,
      delivery_date: formValues.delivery_date || undefined,
      payment_method: formValues.payment_method,
      deposit_amount: formValues.deposit_amount || 0,
      coupon_code: this.appliedCoupon?.code || undefined,
      items: this.cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        final_price: item.final_price,
        subtotal: item.subtotal,
        unit_label: item.unit_label,
        is_weighable: item.is_weighable,
        discount_applied: item.discount_applied
      }))
    };
  }

  private async showOrderSummary(order: any) {
    const modal = await this.modalCtrl.create({
      component: OrderSummaryModal,
      componentProps: {
        data: {
          order,
          includeQueue: true,
          showActions: true,
          title: 'Orden Creada Exitosamente'
        }
      },
      backdropDismiss: false
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    
    // Navegar de vuelta a la lista de órdenes
    this.router.navigate(['/orders']);
  }

  // === UTILIDADES ===

  formatQuantity(item: CartItem): string {
    if (!item.is_weighable) {
      return item.quantity.toString();
    }
    return item.quantity < 1 
      ? `${(item.quantity * 1000).toFixed(0)}g`
      : `${item.quantity.toFixed(3)}kg`;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  async cancelOrder() {
  if (this.cartItems.length === 0) {
    this.router.navigate(['/orders']);
    return;
  }

  const alert = await this.alertCtrl.create({
    header: 'Cancelar Orden',
    message: '¿Está seguro que desea cancelar? Se perderán todos los productos agregados.',
    buttons: [
      { text: 'No', role: 'cancel' },
      { text: 'Sí, cancelar', handler: () => this.router.navigate(['/orders']) }
    ]
  });

  await alert.present();
}

  // === TRACKBY FUNCTIONS ===
  
  trackByProductId(index: number, product: Producto): string {
    return product.id;
  }

  trackByCartItem(index: number, item: CartItem): string {
    return item.tempId;
  }

  trackByCategoryId(index: number, category: Categoria): string {
    return category.id;
  }
}