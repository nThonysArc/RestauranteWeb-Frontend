import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent implements OnInit {
  carritoService = inject(CarritoService); // Público para usar en HTML
  private http = inject(HttpClient);
  private router = inject(Router);

  items: ItemCarrito[] = [];
  total: number = 0;
  clienteData: any = null; // Para mostrar dirección de envío
  cargando = false;

  ngOnInit() {
    this.carritoService.items$.subscribe(data => {
      this.items = data;
      this.total = this.carritoService.obtenerTotal();
    });

    this.cargarDatosCliente();
  }

  cargarDatosCliente() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const user = JSON.parse(usuarioStr);
      // Obtenemos los datos frescos del backend para asegurar dirección correcta
      this.http.get(`http://localhost:8080/api/web/cliente/${user.id}`).subscribe({
        next: (res: any) => this.clienteData = res,
        error: (err) => console.error("Error cargando cliente", err)
      });
    }
  }

  actualizarCantidad(idProducto: number, delta: number) {
    const item = this.items.find(i => i.producto.idProducto === idProducto);
    if (item) {
      // Si delta es -1 y cantidad es 1, no hacemos nada aquí (el botón eliminar es para eso)
      // O permitimos bajar a 0 y eliminar? Mejor explícito.
      if (delta === -1 && item.cantidad === 1) return;

      this.carritoService.agregarProducto(item.producto, delta); 
    }
  }

  eliminar(id: number) {
    this.carritoService.eliminarProducto(id);
  }

  confirmarPedido() {
    if (!this.clienteData) {
      alert("Error: No se identificó al cliente. Por favor inicia sesión nuevamente.");
      this.router.navigate(['/login']);
      return;
    }
    
    // Validación estricta de datos de delivery
    if (!this.clienteData.direccionPrincipal || !this.clienteData.telefono) {
      alert("Faltan datos de envío (Dirección o Teléfono). Por favor agrégalos en tu Perfil.");
      this.router.navigate(['/perfil']);
      return;
    }

    this.cargando = true;
    const pedidoDTO = {
      idClienteWeb: this.clienteData.idClienteWeb,
      direccionEntrega: this.clienteData.direccionPrincipal,
      telefonoContacto: this.clienteData.telefono,
      referencia: this.clienteData.referenciaDireccion,
      metodoPago: 'EFECTIVO', // Podrías poner un select en el HTML para cambiar esto
      detalles: this.items.map(i => ({
        idProducto: i.producto.idProducto,
        cantidad: i.cantidad,
        observaciones: i.observaciones
      }))
    };

    this.http.post('http://localhost:8080/api/web/pedidos', pedidoDTO).subscribe({
      next: () => {
        this.cargando = false;
        alert("¡Pedido enviado con éxito! 🚀\nLa cocina ha recibido tu orden.");
        this.carritoService.limpiarCarrito();
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
      }
    });
  }
}