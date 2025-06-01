// src/app/orders/modals/coupon.modal.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonicModule, 
  ModalController, 
  LoadingController, 
  AlertController,
  ToastController 
} from '@ionic/angular';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { OrderService } from '../services/order.service';
import { CouponService } from '../../shared/services/coupon.service';

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
}

export interface CouponApplicationResult {
  applied: boolean;
  couponCode: string;
  discountAmount: number;
  paymentMethod?: string;
  finalTotal: number;
}

@Component({
  selector: 'app-coupon-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupon.modal.html',
  styleUrls: ['./coupon.modal.scss']
})
export class CouponModal implements OnInit {
  @Input() orderTotal!: number;
  @Input() orderId!: string;
  @Input() currentPaymentMethod?: string;

  couponForm: FormGroup;
  validationResult: CouponValidationResult | null = null;
  validating = false;
  applying = false;
  showPaymentMethod = false;
  
  // Sugerencias de cupones
  suggestedCoupons: any[] = [];
  showSuggestions = true;

  constructor(
    private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private orderService: OrderService,
    private couponService: CouponService
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Z0-9]+$/) // Solo letras mayúsculas y números
      ]],
      paymentMethod: [this.currentPaymentMethod || 'cash']
    });
  }

  ngOnInit() {
    this.loadSuggestedCoupons();
    this.setupFormValidation();
  }

  private async loadSuggestedCoupons() {
    try {
      // Cargar cupones activos y sugeridos basados en el total
      this.suggestedCoupons = await this.couponService.getSuggestedCoupons(this.orderTotal).toPromise() || [];
      console.log('💡 Cupones sugeridos:', this.suggestedCoupons);
    } catch (error) {
      console.error('❌ Error cargando cupones sugeridos:', error);
      // No mostrar error al usuario, simplemente no mostrar sugerencias
    }
  }

  private setupFormValidation() {
    // Convertir código a mayúsculas automáticamente
    this.couponForm.get('couponCode')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.couponForm.get('couponCode')?.setValue(upperValue, { emitEvent: false });
        }
      }
    });
  }

  async validateCoupon() {
    if (this.couponForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.validating = true;
    this.validationResult = null;

    const couponCode = this.couponForm.get('couponCode')?.value;
    const paymentMethod = this.couponForm.get('paymentMethod')?.value;

    try {
      console.log('🎟️ Validando cupón:', { couponCode, paymentMethod, orderTotal: this.orderTotal });

      // Simular delay realista
      await timer(800).toPromise();

      const result = await this.couponService.validateCoupon(
        couponCode,
        this.orderTotal,
        paymentMethod
      ).toPromise();

      this.validationResult = result!;
      
      if (result?.requires_cash && paymentMethod !== 'cash') {
        this.showPaymentMethod = true;
        this.couponForm.patchValue({ paymentMethod: 'cash' });
      }

      console.log('✅ Resultado de validación:', this.validationResult);

    } catch (error: any) {
      console.error('❌ Error validando cupón:', error);
      
      this.validationResult = {
        valid: false,
        discount_amount: 0,
        discount_type: 'fixed',
        discount_value: 0,
        error: error.message || 'Error al validar el cupón'
      };
    } finally {
      this.validating = false;
    }
  }

  async applySuggestedCoupon(coupon: any) {
    this.couponForm.patchValue({ couponCode: coupon.code });
    this.clearValidation();
    await this.validateCoupon();
  }

  async applyCoupon() {
    if (!this.validationResult?.valid) {
      await this.showToast('Debe validar el cupón primero', 'warning');
      return;
    }

    this.applying = true;

    const loading = await this.loadingCtrl.create({
      message: 'Aplicando cupón...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const couponData = {
        coupon_code: this.couponForm.get('couponCode')?.value,
        payment_method: this.couponForm.get('paymentMethod')?.value
      };

      const updatedOrder = await this.orderService.applyCoupon(this.orderId, couponData).toPromise();

      await loading.dismiss();
      
      const result: CouponApplicationResult = {
        applied: true,
        couponCode: couponData.coupon_code,
        discountAmount: this.validationResult.discount_amount,
        paymentMethod: couponData.payment_method,
        finalTotal: this.getFinalTotal()
      };

      await this.showToast('¡Cupón aplicado exitosamente!', 'success');
      
      this.modalController.dismiss(result);

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Error aplicando cupón:', error);
      
      let errorMessage = 'Error al aplicar el cupón';
      if (error.status === 400) {
        errorMessage = error.error?.error || 'Cupón inválido';
      } else if (error.status === 409) {
        errorMessage = 'Este cupón ya ha sido utilizado';
      }
      
      await this.showAlert('Error', errorMessage);
    } finally {
      this.applying = false;
    }
  }

  clearValidation() {
    this.validationResult = null;
    this.showPaymentMethod = false;
  }

  async showCouponHelp() {
    const alert = await this.alertCtrl.create({
      header: 'Ayuda - Cupones',
      message: `
        <p><strong>Formato:</strong> Solo letras mayúsculas y números</p>
        <p><strong>Ejemplos:</strong> DESC10, EFECTIVO15, FIJO50</p>
        <p><strong>Restricciones:</strong> Algunos cupones requieren pago en efectivo</p>
        <p><strong>Límites:</strong> Pueden tener montos mínimos de compra</p>
      `,
      buttons: ['Entendido'],
      cssClass: 'help-alert'
    });
    await alert.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getFinalTotal(): number {
    if (this.validationResult?.valid) {
      return Math.max(0, this.orderTotal - this.validationResult.discount_amount);
    }
    return this.orderTotal;
  }

  getSavingsAmount(): number {
    return this.validationResult?.valid ? this.validationResult.discount_amount : 0;
  }

  getSavingsPercentage(): number {
    const savings = this.getSavingsAmount();
    return this.orderTotal > 0 ? (savings / this.orderTotal) * 100 : 0;
  }

  isFormValid(): boolean {
    return this.couponForm.valid && !!this.couponForm.get('couponCode')?.value;
  }

  canApplyCoupon(): boolean {
    return this.validationResult?.valid === true && !this.applying && !this.validating;
  }

  private markFormGroupTouched() {
    Object.keys(this.couponForm.controls).forEach(key => {
      const control = this.couponForm.get(key);
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

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Getters para el template
  get couponCodeControl() {
    return this.couponForm.get('couponCode');
  }

  get paymentMethodControl() {
    return this.couponForm.get('paymentMethod');
  }

  get hasValidationErrors(): boolean {
    return this.couponCodeControl?.invalid && this.couponCodeControl?.touched || false;
  }

  get validationErrorMessage(): string {
    const control = this.couponCodeControl;
    if (control?.hasError('required')) {
      return 'Ingrese un código de cupón';
    }
    if (control?.hasError('minlength')) {
      return 'El código debe tener al menos 3 caracteres';
    }
    if (control?.hasError('maxlength')) {
      return 'El código no puede tener más de 20 caracteres';
    }
    if (control?.hasError('pattern')) {
      return 'Solo se permiten letras mayúsculas y números';
    }
    return '';
  }
}