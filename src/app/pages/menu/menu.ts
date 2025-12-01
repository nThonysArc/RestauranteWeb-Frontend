import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

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

  // --- NUEVA LÓGICA SIMPLIFICADA ---
  
  agregarAlCarrito(producto: Producto) {
    const token = localStorage.getItem('token');

    // 1. Si NO hay sesión, mostrar modal de advertencia
    if (!token) {
      this.abrirLoginModal();
      return; 
    }

    // 2. Si HAY sesión, agregar directo al carrito
    this.carritoService.agregarProducto(producto);
    
    // Feedback visual simple
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  // --- GESTIÓN DE MODALES ---

  abrirLoginModal() {
    const el = document.getElementById('loginModal');
    if (el) {
      this.loginModal = new bootstrap.Modal(el);
      this.loginModal.show();
    }
  }

  // Método auxiliar para cerrar modal y navegar
  private cerrarModalYNavegar(ruta: string) {
    if (this.loginModal) {
      this.loginModal.hide();
    } else {
      const el = document.getElementById('loginModal');
      if (el) {
        const instance = bootstrap.Modal.getInstance(el);
        if (instance) instance.hide();
      }
    }
    // Limpieza de backdrop
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