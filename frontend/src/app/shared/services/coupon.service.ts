// src/app/shared/services/coupon.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  is_active: boolean;
  valid_from: string;
  valid_to?: string;
  usage_count: number;
  max_usage?: number;
  cash_payment_only: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CouponValidationRequest {
  coupon_code: string;
  total_amount: number;
  payment_method?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  message?: string;
  error?: string;
  requires_cash?: boolean;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  coupon?: Coupon;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiUrl}/coupons`;
  private couponsSubject = new BehaviorSubject<Coupon[]>([]);
  public coupons$ = this.couponsSubject.asObservable();

  // Mock data para desarrollo - En producción esto vendría de la API
  private mockCoupons: Coupon[] = [
    {
      id: '1',
      code: 'DESC10',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase_amount: 100,
      is_active: true,
      valid_from: '2024-01-01T00:00:00Z',
      valid_to: '2024-12-31T23:59:59Z',
      usage_count: 45,
      max_usage: 1000,
      cash_payment_only: false,
      description: '10% de descuento en compras mayores a $100',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      code: 'EFECTIVO15',
      discount_type: 'percentage',
      discount_value: 15,
      min_purchase_amount: 50,
      is_active: true,
      valid_from: '2024-01-01T00:00:00Z',
      valid_to: '2024-12-31T23:59:59Z',
      usage_count: 23,
      max_usage: 500,
      cash_payment_only: true,
      description: '15% de descuento pagando en efectivo (min $50)',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      code: 'FIJO50',
      discount_type: 'fixed',
      discount_value: 50,
      min_purchase_amount: 200,
      max_discount_amount: 50,
      is_active: true,
      valid_from: '2024-01-01T00:00:00Z',
      valid_to: '2024-12-31T23:59:59Z',
      usage_count: 12,
      max_usage: 100,
      cash_payment_only: false,
      description: '$50 de descuento en compras mayores a $200',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      code: 'NUEVO20',
      discount_type: 'percentage',
      discount_value: 20,
      min_purchase_amount: 150,
      is_active: true,
      valid_from: '2024-01-01T00:00:00Z',
      valid_to: '2024-12-31T23:59:59Z',
      usage_count: 8,
      max_usage: 50,
      cash_payment_only: false,
      description: '20% de descuento para nuevos clientes',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  constructor(private http: HttpClient) {
    this.couponsSubject.next(this.mockCoupons);
  }

  // === MÉTODOS PRINCIPALES ===

  /**
   * Obtener todos los cupones activos
   */
  getActiveCoupons(): Observable<Coupon[]> {
    // En producción sería: return this.http.get<Coupon[]>(`${this.apiUrl}?is_active=true`);
    return of(this.mockCoupons.filter(c => c.is_active))
      .pipe(
        delay(300), // Simular latencia
        tap(coupons => {
          console.log('✅ Cupones activos cargados:', coupons.length);
          this.couponsSubject.next(coupons);
        })
      );
  }

  /**
   * Obtener cupones sugeridos basados en el total de compra
   */
  getSuggestedCoupons(totalAmount: number): Observable<Coupon[]> {
    return this.getActiveCoupons()
      .pipe(
        map(coupons => {
          const suggested = coupons.filter(coupon => {
            // Filtrar cupones aplicables al total actual
            if (coupon.min_purchase_amount > totalAmount) {
              return false; // No cumple el mínimo
            }

            // Verificar si no ha alcanzado el máximo de usos
            if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
              return false;
            }

            // Verificar fechas de validez
            const now = new Date();
            const validFrom = new Date(coupon.valid_from);
            const validTo = coupon.valid_to ? new Date(coupon.valid_to) : null;

            if (now < validFrom || (validTo && now > validTo)) {
              return false;
            }

            return true;
          });

          // Ordenar por beneficio (mayor descuento primero)
          return suggested.sort((a, b) => {
            const discountA = this.calculateDiscount(a, totalAmount);
            const discountB = this.calculateDiscount(b, totalAmount);
            return discountB - discountA;
          }).slice(0, 4); // Máximo 4 sugerencias
        }),
        tap(suggested => console.log('💡 Cupones sugeridos:', suggested))
      );
  }

  /**
   * Validar un cupón
   */
  validateCoupon(
    couponCode: string, 
    totalAmount: number, 
    paymentMethod: string = 'cash'
  ): Observable<CouponValidationResult> {
    
    console.log('🎟️ Validando cupón:', { couponCode, totalAmount, paymentMethod });

    // En producción sería:
    // const params = new HttpParams()
    //   .set('code', couponCode)
    //   .set('total_amount', totalAmount.toString())
    //   .set('payment_method', paymentMethod);
    // return this.http.post<CouponValidationResult>(`${this.apiUrl}/validate`, { couponCode, totalAmount, paymentMethod });

    return of(null).pipe(
      delay(1000), // Simular latencia de API
      map(() => {
        const coupon = this.mockCoupons.find(c => 
          c.code.toUpperCase() === couponCode.toUpperCase() && c.is_active
        );

        if (!coupon) {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: 'fixed' as const,
            discount_value: 0,
            error: 'Cupón no encontrado o expirado'
          };
        }

        // Verificar monto mínimo
        if (coupon.min_purchase_amount > totalAmount) {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            error: `El monto mínimo para este cupón es $${coupon.min_purchase_amount}`,
            min_purchase_amount: coupon.min_purchase_amount
          };
        }

        // Verificar método de pago
        if (coupon.cash_payment_only && paymentMethod !== 'cash') {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            error: 'Este cupón solo es válido para pagos en efectivo',
            requires_cash: true
          };
        }

        // Verificar límite de uso
        if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            error: 'Este cupón ha alcanzado su límite de uso'
          };
        }

        // Verificar fechas
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validTo = coupon.valid_to ? new Date(coupon.valid_to) : null;

        if (now < validFrom) {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            error: 'Este cupón aún no es válido'
          };
        }

        if (validTo && now > validTo) {
          return {
            valid: false,
            discount_amount: 0,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            error: 'Este cupón ha expirado'
          };
        }

        // Calcular descuento
        const discountAmount = this.calculateDiscount(coupon, totalAmount);

        return {
          valid: true,
          discount_amount: discountAmount,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          message: `Cupón válido: ${coupon.description}`,
          requires_cash: coupon.cash_payment_only,
          min_purchase_amount: coupon.min_purchase_amount,
          max_discount_amount: coupon.max_discount_amount,
          coupon
        };
      }),
      catchError(error => {
        console.error('❌ Error validando cupón:', error);
        return of({
          valid: false,
          discount_amount: 0,
          discount_type: 'fixed' as const,
          discount_value: 0,
          error: 'Error al validar el cupón. Intente nuevamente.'
        });
      })
    );
  }

  /**
   * Aplicar cupón a una orden (esto se hace en OrderService)
   * Este método es principalmente para logging y estadísticas
   */
  applyCoupon(orderId: string, couponCode: string): Observable<any> {
    console.log('✅ Cupón aplicado:', { orderId, couponCode });
    
    // Incrementar contador de uso (mock)
    const coupon = this.mockCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      coupon.usage_count++;
    }

    return of({ success: true, message: 'Cupón aplicado exitosamente' });
  }

  /**
   * Obtener estadísticas de uso de cupones
   */
  getCouponStats(): Observable<any> {
    return of(this.mockCoupons).pipe(
      map(coupons => ({
        total_coupons: coupons.length,
        active_coupons: coupons.filter(c => c.is_active).length,
        total_usage: coupons.reduce((sum, c) => sum + c.usage_count, 0),
        most_used: coupons.sort((a, b) => b.usage_count - a.usage_count)[0],
        by_type: {
          percentage: coupons.filter(c => c.discount_type === 'percentage').length,
          fixed: coupons.filter(c => c.discount_type === 'fixed').length
        }
      })),
      tap(stats => console.log('📊 Estadísticas de cupones:', stats))
    );
  }

  // === MÉTODOS AUXILIARES ===

  /**
   * Calcular el descuento que aplicaría un cupón
   */
  private calculateDiscount(coupon: Coupon, totalAmount: number): number {
    let discount = 0;

    if (coupon.discount_type === 'percentage') {
      discount = totalAmount * (coupon.discount_value / 100);
    } else {
      discount = coupon.discount_value;
    }

    // Aplicar límite máximo si existe
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }

    // No puede ser mayor al total
    discount = Math.min(discount, totalAmount);

    return Math.round(discount * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Formatear información de descuento para mostrar
   */
  formatDiscountInfo(coupon: Coupon): string {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `$${coupon.discount_value} OFF`;
    }
  }

  /**
   * Verificar si un cupón es aplicable a un total
   */
  isCouponApplicable(coupon: Coupon, totalAmount: number, paymentMethod: string = 'cash'): boolean {
    if (!coupon.is_active) return false;
    if (coupon.min_purchase_amount > totalAmount) return false;
    if (coupon.cash_payment_only && paymentMethod !== 'cash') return false;
    
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = coupon.valid_to ? new Date(coupon.valid_to) : null;
    
    if (now < validFrom || (validTo && now > validTo)) return false;
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) return false;
    
    return true;
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.couponsSubject.next([]);
  }
}