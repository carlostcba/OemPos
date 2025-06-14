import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class CashRegisterComponent implements OnInit {

  // Variables para resumen de ingresos del día
  totalEfectivo: number = 0;
  totalDebito: number = 0;
  totalCredito: number = 0;
  totalBilletera: number = 0;
  totalDescuentos: number = 0;
  totalPagosProveedores: number = 0;

  // Estado de la caja
  cajaAbierta: boolean = true;

  // Lista de comandas (órdenes en curso)
  comandas: any[] = [];

  constructor() {}

  ngOnInit() {
    this.cargarResumenCaja();
    this.cargarComandas();
  }

  cargarResumenCaja() {
    // TODO: Llamar a servicio para traer resumen de caja (ingresos, descuentos, egresos)
  }

  cargarComandas() {
    // TODO: Llamar a servicio para obtener comandas activas (ordenes, pedidos, deliveries, salon)
  }

  abrirCaja() {
    // TODO: Implementar lógica para apertura de caja
  }

  cerrarCaja() {
    // TODO: Implementar lógica para cierre de caja con validación de totales
  }

  registrarPagoProveedor() {
    // TODO: Implementar registro de egreso a proveedor
  }

  agregarIngresoManual() {
    // TODO: Implementar carga de ingreso manual (ej: fondo inicial)
  }

  verDetalleMovimiento(movimiento: any) {
    // TODO: Mostrar modal o detalle con información del movimiento
  }

  marcarOrdenComoPagada(orden: any) {
    // TODO: Cambiar estado de orden a 'pagado'
  }

  cancelarOrden(orden: any) {
    // TODO: Cancelar la orden y registrar el motivo
  }
}
