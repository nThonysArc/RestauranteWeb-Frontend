import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
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
    metodoPago: 'EFECTIVO' // Valor por defecto
  };

  cargando = false;

  ngOnInit() {
    // 1. Suscribirse a cambios en el carrito
    this.carritoService.items$.subscribe(data => {
      this.items = data;
      this.total = this.carritoService.obtenerTotal();
    });

    // 2. Precargar datos del usuario si existen (para mejor UX)
    // Intentamos recuperar los datos que guardamos al hacer login
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        // Podríamos tener datos aquí si los hubiéramos guardado al registrarse
        // Si no, el usuario debe llenarlos manualmente
    }
  }

  eliminarItem(idProducto: number) {
    this.carritoService.eliminarProducto(idProducto);
  }

  realizarPedido() {
    // Validaciones básicas
    if (this.items.length === 0) {
      alert('Tu carrito está vacío. Agrega productos desde el menú.');
      return;
    }

    if (!this.datosEntrega.direccion || !this.datosEntrega.telefono) {
      alert('Por favor completa la dirección y el teléfono de contacto.');
      return;
    }

    this.cargando = true;

    // Obtener ID del cliente logueado desde localStorage
    // Recuerda que guardamos esto en el Login.ts como: { id, nombre, rol }
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idCliente = usuarioData.id; 

    if (!idCliente) {
      alert('Tu sesión ha expirado o es inválida. Por favor inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    // Construir el objeto JSON para el backend
    // Debe coincidir con la clase PedidoWebDTO.java
    const pedidoDTO = {
      idClienteWeb: idCliente,
      direccionEntrega: this.datosEntrega.direccion,
      referencia: this.datosEntrega.referencia,
      telefonoContacto: this.datosEntrega.telefono,
      metodoPago: this.datosEntrega.metodoPago,
      // Detalles del pedido (Carrito)
      detalles: this.items.map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad,
        observaciones: item.observaciones
        // NOTA: No enviamos precio ni subtotal aquí por seguridad.
        // El backend buscará el precio real en la base de datos.
      }))
    };

    // Enviar al Backend
    this.http.post('http://localhost:8080/api/web/pedidos', pedidoDTO)
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          // Éxito: Limpiamos y redirigimos
          alert('¡Pedido enviado con éxito! 🚀\nLa cocina ha recibido tu orden y la está preparando.');
          this.carritoService.limpiarCarrito(); 
          this.router.navigate(['/']); // Volver al inicio
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