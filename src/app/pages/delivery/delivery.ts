import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './delivery.html',
  styleUrls: ['./delivery.scss']
})
export class Delivery {
  pedido = {
    nombre: '',
    telefono: '',
    direccion: '',
    pedido: '',
    cantidad: 1
  };

  
 private backendUrl = 'http://localhost:8080/api/web/pedidos';


  constructor(private http: HttpClient) {}

  enviarPedido() {
    this.http.post(this.backendUrl, this.pedido)
      .subscribe({
        next: (res: any) => alert(res.mensaje),
        error: (err) => {
          console.error('Error al enviar el pedido:', err);
          alert('❌ Error al enviar el pedido');
        }
      });
  }
}

