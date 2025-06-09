// src/app/orders/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../../productos/services/producto.service';

export interface CartItem {
  product: Producto;
  quantity: number;
  subtotal: number;
  notes?: string;
  customPrice?: number; // Para productos con precio variable
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  private totalSubject = new BehaviorSubject<number>(0);
  public total$: Observable<number> = this.totalSubject.asObservable();

  private itemCountSubject = new BehaviorSubject<number>(0);
  public itemCount$: Observable<number> = this.itemCountSubject.asObservable();

  constructor() {
    // Cargar carrito desde localStorage al inicializar
    this.loadCartFromStorage();
  }

  // Obtener items actuales del carrito
  get currentItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  // Obtener total actual
  get currentTotal(): number {
    return this.totalSubject.value;
  }

  // Obtener cantidad total de items
  get currentItemCount(): number {
    return this.itemCountSubject.value;
  }

  // Agregar producto al carrito
  addToCart(product: Producto, quantity: number = 1, notes?: string): void {
    const currentItems = this.cartItemsSubject.value;
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      // Si el producto ya existe, actualizar cantidad
      const updatedItems = [...currentItems];
      const existingItem = updatedItems[existingIndex];
      
      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
        subtotal: (existingItem.quantity + quantity) * (existingItem.customPrice || product.price),
        notes: notes || existingItem.notes
      };
      
      this.updateCart(updatedItems);
    } else {
      // Si es un producto nuevo, agregarlo
      const newItem: CartItem = {
        product,
        quantity,
        subtotal: quantity * product.price,
        notes
      };
      
      this.updateCart([...currentItems, newItem]);
    }
  }

  // Actualizar cantidad de un producto específico
  updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    
    if (quantity <= 0) {
      // Si la cantidad es 0 o negativa, remover el item
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = currentItems.map(item => {
      if (item.product.id === productId) {
        const price = item.customPrice || item.product.price;
        return {
          ...item,
          quantity,
          subtotal: quantity * price
        };
      }
      return item;
    });

    this.updateCart(updatedItems);
  }

  // Actualizar precio personalizado (para productos pesables)
  updateCustomPrice(productId: string, customPrice: number): void {
    const currentItems = this.cartItemsSubject.value;
    
    const updatedItems = currentItems.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          customPrice,
          subtotal: item.quantity * customPrice
        };
      }
      return item;
    });

    this.updateCart(updatedItems);
  }

  // Actualizar notas de un producto
  updateNotes(productId: string, notes: string): void {
    const currentItems = this.cartItemsSubject.value;
    
    const updatedItems = currentItems.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          notes
        };
      }
      return item;
    });

    this.updateCart(updatedItems);
  }

  // Remover producto del carrito
  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.updateCart(updatedItems);
  }

  // Limpiar todo el carrito
  clearCart(): void {
    this.updateCart([]);
    this.clearCartFromStorage();
  }

  // Verificar si un producto está en el carrito
  isInCart(productId: string): boolean {
    return this.cartItemsSubject.value.some(item => item.product.id === productId);
  }

  // Obtener cantidad de un producto específico
  getProductQuantity(productId: string): number {
    const item = this.cartItemsSubject.value.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  // Aplicar descuento al carrito
  applyDiscount(discountAmount: number): number {
    const currentTotal = this.totalSubject.value;
    return Math.max(0, currentTotal - discountAmount);
  }

  // Convertir items del carrito a formato para API
  toOrderItems(): any[] {
    return this.cartItemsSubject.value.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.customPrice || item.product.price,
      final_price: item.customPrice || item.product.price,
      subtotal: item.subtotal,
      unit_label: item.product.unit_label,
      is_weighable: item.product.is_weighable,
      notes: item.notes || null
    }));
  }

  // Validar carrito antes de procesar orden
  validateCart(): { valid: boolean; errors: string[] } {
    const items = this.cartItemsSubject.value;
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('El carrito está vacío');
    }

    // Validar cantidades
    items.forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`Cantidad inválida para ${item.product.name}`);
      }
      
      if (item.product.is_weighable && item.quantity < 0.001) {
        errors.push(`Peso mínimo para ${item.product.name}: 1g`);
      }
      
      if (!item.product.is_weighable && item.quantity < 1) {
        errors.push(`Cantidad mínima para ${item.product.name}: 1 unidad`);
      }
    });

    // Validar stock (si está disponible)
    items.forEach(item => {
      if (item.product.track_stock && item.product.stock < item.quantity) {
        errors.push(`Stock insuficiente para ${item.product.name}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtener resumen del carrito
  getCartSummary(): {
    itemCount: number;
    totalItems: number;
    subtotal: number;
    uniqueProducts: number;
  } {
    const items = this.cartItemsSubject.value;
    
    return {
      itemCount: this.itemCountSubject.value,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: this.totalSubject.value,
      uniqueProducts: items.length
    };
  }

  // Duplicar item en el carrito
  duplicateItem(productId: string): void {
    const currentItems = this.cartItemsSubject.value;
    const itemToDuplicate = currentItems.find(item => item.product.id === productId);
    
    if (itemToDuplicate) {
      this.addToCart(itemToDuplicate.product, itemToDuplicate.quantity, itemToDuplicate.notes);
    }
  }

  // Métodos privados
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.calculateTotals(items);
    this.saveCartToStorage(items);
  }

  private calculateTotals(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    this.totalSubject.next(total);
    this.itemCountSubject.next(itemCount);
  }

  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('cart_items');
      if (savedCart) {
        const items: CartItem[] = JSON.parse(savedCart);
        this.updateCart(items);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  private clearCartFromStorage(): void {
    try {
      localStorage.removeItem('cart_items');
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  }

  // Formatear cantidad para mostrar
  formatQuantity(item: CartItem): string {
    if (item.product.is_weighable) {
      return item.quantity < 1 
        ? `${(item.quantity * 1000).toFixed(0)}g`
        : `${item.quantity.toFixed(3)}kg`;
    }
    return item.quantity.toString();
  }

  // Obtener precio efectivo de un item (personalizado o del producto)
  getEffectivePrice(item: CartItem): number {
    return item.customPrice || item.product.price;
  }

  // Método para debugging
  debugCart(): void {
    console.group('🛒 Cart Debug Info');
    console.log('Items:', this.cartItemsSubject.value);
    console.log('Total:', this.totalSubject.value);
    console.log('Item Count:', this.itemCountSubject.value);
    console.log('Summary:', this.getCartSummary());
    console.log('Validation:', this.validateCart());
    console.groupEnd();
  }
}