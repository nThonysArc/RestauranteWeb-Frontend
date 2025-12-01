import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
// Corrección: Importar desde carrito.service
import { CarritoService, ItemCarrito } from '../../services/carrito.service';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './delivery.html',
  styleUrls: ['./delivery.scss']
})
export class Delivery implements OnInit {
  private http = inject(HttpClient);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  // Datos del carrito
  items: ItemCarrito[] = [];
  total: number = 0;

  // Datos del formulario de envío
  datosEntrega = {
    direccion: '',
    referencia: '',
    telefono: '',
    metodoPago: 'EFECTIVO' 
  };

  cargando = false;

  ngOnInit() {
    this.carritoService.items$.subscribe(data => {
      this.items = data;
      this.total = this.carritoService.obtenerTotal();
    });

    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        // Lógica de precarga si existiera
    }
  }

  eliminarItem(idProducto: number) {
    this.carritoService.eliminarProducto(idProducto);
  }

  realizarPedido() {
    if (this.items.length === 0) {
      alert('Tu carrito está vacío. Agrega productos desde el menú.');
      return;
    }

    if (!this.datosEntrega.direccion || !this.datosEntrega.telefono) {
      alert('Por favor completa la dirección y el teléfono de contacto.');
      return;
    }

    this.cargando = true;

    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idCliente = usuarioData.id; 

    if (!idCliente) {
      alert('Tu sesión ha expirado o es inválida. Por favor inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const pedidoDTO = {
      idClienteWeb: idCliente,
      direccionEntrega: this.datosEntrega.direccion,
      referencia: this.datosEntrega.referencia,
      telefonoContacto: this.datosEntrega.telefono,
      metodoPago: this.datosEntrega.metodoPago,
      detalles: this.items.map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad,
        observaciones: item.observaciones
      }))
    };

    this.http.post('http://localhost:8080/api/web/pedidos', pedidoDTO)
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          alert('¡Pedido enviado con éxito! 🚀\nLa cocina ha recibido tu orden y la está preparando.');
          this.carritoService.limpiarCarrito(); 
          this.router.navigate(['/']); 
        },
        error: (err) => {
          console.error('Error al enviar pedido:', err);
          this.cargando = false;
          if (err.status === 403) {
             alert('Error de autorización. Por favor vuelve a iniciar sesión.');
             this.router.navigate(['/login']);
          } else {
             alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
          }
        }
      });
  }
}