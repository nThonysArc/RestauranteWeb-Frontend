import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http'; // Necesario para enviar el pedido directo
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';
// Ya no usamos CarritoService para "acumular", el pedido es directo por plato (o puedes mantener la lógica de acumular si prefieres un modal de carrito flotante, pero simplifiquemos a pedido directo por ahora según tu indicación).
// Si quieres mantener el carrito acumulativo sin vista, avísame. Asumiré pedido directo por ítem para simplificar la eliminación de la vista delivery.

declare var bootstrap: any;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  private productoService = inject(ProductoService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  todosLosProductos: Producto[] = [];
  todasLasCategorias: Categoria[] = [];
  categoriasPrincipales: Categoria[] = [];
  subcategoriasDisponibles: Categoria[] = [];
  productosFiltrados: Producto[] = [];

  textoBusqueda: string = '';
  idCategoriaPadreSeleccionada: number = -1;
  idSubcategoriaSeleccionada: number = -1;

  cargando: boolean = true; 
  errorCarga: boolean = false;
  
  private backendUrl = 'http://localhost:8080';
  private loginModal: any; 
  private confirmacionModal: any; // Modal para confirmar pedido

  productoSeleccionado: Producto | null = null; // Para el modal de confirmación
  cantidadSeleccionada: number = 1;
  observaciones: string = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      categorias: this.productoService.obtenerCategorias()
    }).subscribe({
      next: (res) => {
        this.todosLosProductos = res.productos;
        this.todasLasCategorias = res.categorias;
        this.categoriasPrincipales = this.todasLasCategorias
          .filter(c => !c.idCategoriaPadre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.productosFiltrados = this.todosLosProductos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorCarga = true;
        this.cargando = false;
      }
    });
  }

  onCategoriaPadreChange() {
    this.idSubcategoriaSeleccionada = -1;
    if (this.idCategoriaPadreSeleccionada !== -1) {
      this.subcategoriasDisponibles = this.todasLasCategorias
        .filter(c => c.idCategoriaPadre === this.idCategoriaPadreSeleccionada)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else {
      this.subcategoriasDisponibles = [];
    }
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const texto = this.textoBusqueda.toLowerCase();
    this.productosFiltrados = this.todosLosProductos.filter(producto => {
      const coincideTexto = producto.nombre.toLowerCase().includes(texto) || 
                            (producto.descripcion && producto.descripcion.toLowerCase().includes(texto));
      let coincideCategoria = true;
      if (this.idSubcategoriaSeleccionada !== -1) {
        coincideCategoria = producto.idCategoria === this.idSubcategoriaSeleccionada;
      } else if (this.idCategoriaPadreSeleccionada !== -1) {
        const catProducto = this.todasLasCategorias.find(c => c.idCategoria === producto.idCategoria);
        const esDirecta = producto.idCategoria === this.idCategoriaPadreSeleccionada;
        const esHija = catProducto && catProducto.idCategoriaPadre === this.idCategoriaPadreSeleccionada;
        coincideCategoria = esDirecta || Boolean(esHija);
      }
      return coincideTexto && coincideCategoria;
    });
  }

  getImagenUrl(ruta: string | null): string {
    if (!ruta) return 'https://via.placeholder.com/300x200?text=Sin+Imagen'; 
    if (ruta.startsWith('http')) return ruta;
    return `${this.backendUrl}${ruta}`; 
  }

  // --- LÓGICA DE PEDIDO ---

  iniciarPedido(producto: Producto) {
    const token = localStorage.getItem('token');

    if (!token) {
      this.abrirModal('loginModal');
      return; 
    }

    // Si está logueado, abrimos modal de confirmación rápida
    this.productoSeleccionado = producto;
    this.cantidadSeleccionada = 1;
    this.observaciones = '';
    this.abrirModal('confirmacionModal');
  }

  confirmarPedido() {
    if (!this.productoSeleccionado) return;

    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    // NOTA: Asumimos que al registrarse se guardaron dirección y teléfono.
    // Si quisieras ser muy estricto, deberías validar que existan aquí o pedirlos en el modal.
    
    const pedidoDTO = {
      idClienteWeb: usuarioData.id,
      // Usamos valores por defecto o recuperados del perfil (si el backend tuviera endpoint de perfil)
      // Por ahora, enviaremos un string genérico si no los tenemos a mano, 
      // PERO lo ideal es que el Backend recupere la dirección del cliente por su ID.
      // Como tu DTO pide dirección explicita:
      direccionEntrega: "Dirección registrada en cuenta", 
      telefonoContacto: "Teléfono registrado", 
      referencia: this.observaciones, // Usamos observaciones como referencia o nota
      metodoPago: "EFECTIVO", // Por defecto
      detalles: [{
        idProducto: this.productoSeleccionado.idProducto,
        cantidad: this.cantidadSeleccionada,
        observaciones: this.observaciones
      }]
    };

    this.http.post('http://localhost:8080/api/web/pedidos', pedidoDTO)
      .subscribe({
        next: (res) => {
          this.cerrarModal('confirmacionModal');
          alert(`¡Pedido enviado! Estará listo pronto. \nPlato: ${this.productoSeleccionado?.nombre}`);
          this.productoSeleccionado = null;
        },
        error: (err) => {
          console.error('Error al pedir:', err);
          if (err.status === 403) {
            alert('Tu sesión expiró. Por favor inicia sesión de nuevo.');
            this.irALogin();
          } else {
            alert('Hubo un error. Inténtalo más tarde.');
          }
        }
      });
  }

  // --- GESTIÓN DE MODALES ---

  abrirModal(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const modal = new bootstrap.Modal(el);
      if (id === 'loginModal') this.loginModal = modal;
      if (id === 'confirmacionModal') this.confirmacionModal = modal;
      modal.show();
    }
  }

  cerrarModal(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const instance = bootstrap.Modal.getInstance(el);
      if (instance) instance.hide();
    }
    // Limpieza de backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');
  }

  irALogin() {
    this.cerrarModal('loginModal');
    this.router.navigate(['/login']);
  }

  irARegistro() {
    this.cerrarModal('loginModal');
    this.router.navigate(['/registro']);
  }
}