import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-galeria-imagenes-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './galeria-imagenes.modal.html',
  styleUrls: ['./galeria-imagenes.modal.scss']
})
export class GaleriaImagenesModal implements OnInit {
  @Input() owner_type!: string;
  @Input() owner_id?: string;
  @Input() tag?: string;

  imagenes: any[] = [];
  cargando = true;
  error = '';

  constructor(private http: HttpClient, private modalCtrl: ModalController) {}

  async ngOnInit() {
    try {
      const params: any = { owner_type: this.owner_type };
      if (this.owner_id) params.owner_id = this.owner_id;
      if (this.tag) params.tag = this.tag;

      const response: any = await this.http.get(`${environment.apiUrl}/images`, { params }).toPromise();
      this.imagenes = response.images;
    } catch (err: any) {
      console.error(err);
      this.error = 'No se pudieron cargar las imágenes';
    } finally {
      this.cargando = false;
    }
  }

  seleccionar(imagen: any) {
    this.modalCtrl.dismiss(imagen);
  }

  cerrar() {
    this.modalCtrl.dismiss(null);
  }
}
