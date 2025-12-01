import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { environment } from '../../environments/environment/environment';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.scss']
})
export class CarritoComponent implements OnInit {
  carritoService = inject(CarritoService); 
  private http = inject(HttpClient);
  private router = inject(Router);

  items: ItemCarrito[] = [];
  total: number = 0;
  clienteData: any = null; 
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
      // CORRECCIÓN CLAVE: Se añade '/api' al endpoint de cliente
      const url = `${environment.apiUrl}/api/web/cliente/${user.id}`;
      
      this.http.get(url).subscribe({
        next: (res: any) => this.clienteData = res,
        error: (err) => console.error("Error cargando cliente", err)
      });
    }
  }

  actualizarCantidad(idProducto: number, delta: number) {
    const item = this.items.find(i => i.producto.idProducto === idProducto);
    if (item) {
      if (delta === -1 && item.cantidad === 1) return;
      this.carritoService.agregarProducto(item.producto, delta); 
    }
  }

  eliminar(id: number) {
    this.carritoService.eliminarProducto(id);
  }

  confirmarPedido() {
    if (!this.clienteData) {
      // Usar lógica de modal o componente visual en lugar de alert() en producción
      alert("Error: No se identificó al cliente. Por favor inicia sesión nuevamente.");
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.clienteData.direccionPrincipal || !this.clienteData.telefono) {
      // Usar lógica de modal o componente visual en lugar de alert() en producción
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
      metodoPago: 'EFECTIVO', 
      detalles: this.items.map(i => ({
        idProducto: i.producto.idProducto,
        cantidad: i.cantidad,
        observaciones: i.observaciones
      }))
    };

    // CORRECCIÓN CLAVE: Se añade '/api' al endpoint de pedidos
    const url = `${environment.apiUrl}/api/web/pedidos`;

    this.http.post(url, pedidoDTO).subscribe({
      next: () => {
        this.cargando = false;
        // Usar lógica de modal o componente visual en lugar de alert() en producción
        alert("¡Pedido enviado con éxito! 🚀\nLa cocina ha recibido tu orden.");
        this.carritoService.limpiarCarrito();
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        // Usar lógica de modal o componente visual en lugar de alert() en producción
        alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
      }
    });
  }
}