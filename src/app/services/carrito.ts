import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Para la navegación al login
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service'; // Importamos el servicio del carrito

// Declaramos la variable bootstrap globalmente para manejar el modal manualmente
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
  private carritoService = inject(CarritoService); // Inyectamos el servicio del carrito
  private router = inject(Router);
  
  // Datos crudos
  todosLosProductos: Producto[] = [];
  todasLasCategorias: Categoria[] = [];

  // Listas para los Selects
  categoriasPrincipales: Categoria[] = [];   // Nivel 1 (ej: Entradas)
  subcategoriasDisponibles: Categoria[] = []; // Nivel 2 (ej: Entradas Frías)

  // Datos mostrados
  productosFiltrados: Producto[] = [];

  // Filtros seleccionados
  textoBusqueda: string = '';
  idCategoriaPadreSeleccionada: number = -1; // -1 = Todas las principales
  idSubcategoriaSeleccionada: number = -1;   // -1 = Todas las subcategorías

  cargando: boolean = true; 
  errorCarga: boolean = false;
  
  private backendUrl = 'http://localhost:8080';
  private loginModal: any; // Referencia para controlar el modal de login

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
        
        // 1. Llenar el primer combo solo con Categorías PADRE (sin idCategoriaPadre)
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

  // Se ejecuta cuando el usuario cambia la Categoría Principal
  onCategoriaPadreChange() {
    // 1. Resetear la subcategoría siempre que cambie el padre
    this.idSubcategoriaSeleccionada = -1;

    // 2. Filtrar las subcategorías que pertenecen a este padre
    if (this.idCategoriaPadreSeleccionada !== -1) {
      this.subcategoriasDisponibles = this.todasLasCategorias
        .filter(c => c.idCategoriaPadre === this.idCategoriaPadreSeleccionada)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else {
      this.subcategoriasDisponibles = [];
    }

    // 3. Aplicar filtro a los productos
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const texto = this.textoBusqueda.toLowerCase();
    
    this.productosFiltrados = this.todosLosProductos.filter(producto => {
      // --- FILTRO DE TEXTO ---
      const coincideTexto = producto.nombre.toLowerCase().includes(texto) || 
                            (producto.descripcion && producto.descripcion.toLowerCase().includes(texto));

      // --- FILTRO DE CATEGORÍA ---
      let coincideCategoria = true;

      // Caso A: Se seleccionó una Subcategoría específica
      if (this.idSubcategoriaSeleccionada !== -1) {
        coincideCategoria = producto.idCategoria === this.idSubcategoriaSeleccionada;
      } 
      // Caso B: Solo se seleccionó Categoría Principal (Traer todo lo de adentro)
      else if (this.idCategoriaPadreSeleccionada !== -1) {
        // El producto es válido si:
        // 1. Su categoría directa es la seleccionada (ej: es un producto asignado directo al padre)
        // 2. O su categoría directa es hija de la seleccionada
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

  // --- LÓGICA DE CARRITO Y SEGURIDAD ---

  agregarAlCarrito(producto: Producto) {
    // 1. Verificar si el usuario está logueado (tiene token)
    const token = localStorage.getItem('token');

    if (!token) {
      // Si no hay token, forzamos el inicio de sesión mostrando el modal
      this.abrirLoginModal();
      return; 
    }

    // 2. Si está logueado, agregamos al servicio del carrito
    this.carritoService.agregarProducto(producto);
    
    // 3. Feedback visual (puedes cambiarlo por un Toast o Snackbar más elegante luego)
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  // Abre el modal usando la API de Bootstrap
  abrirLoginModal() {
    const modalElement = document.getElementById('loginModal');
    if (modalElement) {
      this.loginModal = new bootstrap.Modal(modalElement);
      this.loginModal.show();
    }
  }

  // Redirige al login cerrando el modal correctamente
  irALogin() {
    // 1. Ocultar el modal
    if (this.loginModal) {
      this.loginModal.hide();
    } else {
      // Fallback por si se perdió la referencia
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const instance = bootstrap.Modal.getInstance(modalElement);
        if (instance) instance.hide();
      }
    }

    // 2. Limpiar el backdrop (fondo oscuro) que a veces se queda pegado
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');

    // 3. Navegar
    this.router.navigate(['/login']);
  }
}