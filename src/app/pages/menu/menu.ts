import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service'; 

// Declaramos la variable bootstrap globalmente
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
  private carritoService = inject(CarritoService); 
  private router = inject(Router);
  
  // Datos crudos
  todosLosProductos: Producto[] = [];
  todasLasCategorias: Categoria[] = [];

  // Listas para los Selects
  categoriasPrincipales: Categoria[] = [];   // Nivel 1
  subcategoriasDisponibles: Categoria[] = []; // Nivel 2

  // Datos mostrados
  productosFiltrados: Producto[] = [];

  // Filtros seleccionados
  textoBusqueda: string = '';
  idCategoriaPadreSeleccionada: number = -1; // -1 = Todas
  idSubcategoriaSeleccionada: number = -1;   // -1 = Todas

  cargando: boolean = true; 
  errorCarga: boolean = false;
  
  private backendUrl = 'http://localhost:8080';
  private loginModal: any; 

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
        
        // 1. Llenar el primer combo solo con Categorías PADRE
        this.categoriasPrincipales = this.todasLasCategorias
          .filter(c => !c.idCategoriaPadre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        // 2. Mostrar todo inicialmente
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
      } 
      else if (this.idCategoriaPadreSeleccionada !== -1) {
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

  agregarAlCarrito(producto: Producto) {
    const token = localStorage.getItem('token');

    if (!token) {
      this.abrirLoginModal();
      return; 
    }

    this.carritoService.agregarProducto(producto);
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  abrirLoginModal() {
    const modalElement = document.getElementById('loginModal');
    if (modalElement) {
      this.loginModal = new bootstrap.Modal(modalElement);
      this.loginModal.show();
    }
  }

  // Método auxiliar para cerrar modal y limpiar backdrop
  private cerrarModalYNavegar(ruta: string) {
    if (this.loginModal) {
      this.loginModal.hide();
    } else {
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const instance = bootstrap.Modal.getInstance(modalElement);
        if (instance) instance.hide();
      }
    }

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');

    this.router.navigate([ruta]);
  }

  irALogin() {
    this.cerrarModalYNavegar('/login');
  }

  irARegistro() {
    this.cerrarModalYNavegar('/registro');
  }
}