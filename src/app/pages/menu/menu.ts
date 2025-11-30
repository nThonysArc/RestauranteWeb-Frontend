import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importante para la navegación
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';

// Declaramos la variable bootstrap para que TypeScript la reconozca
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
  private router = inject(Router); // Inyectamos el Router
  
  // Datos crudos
  todosLosProductos: Producto[] = [];
  todasLasCategorias: Categoria[] = [];

  // Listas para los Selects
  categoriasPrincipales: Categoria[] = [];
  subcategoriasDisponibles: Categoria[] = [];

  // Datos mostrados
  productosFiltrados: Producto[] = [];

  // Filtros seleccionados
  textoBusqueda: string = '';
  idCategoriaPadreSeleccionada: number = -1;
  idSubcategoriaSeleccionada: number = -1;

  cargando: boolean = true; 
  errorCarga: boolean = false;
  
  private backendUrl = 'http://localhost:8080';
  private loginModal: any; // Referencia para controlar el modal

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
        
        // Llenar categorías principales
        this.categoriasPrincipales = this.todasLasCategorias
          .filter(c => !c.idCategoriaPadre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Mostrar todo inicialmente
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

  // --- LÓGICA DE SEGURIDAD Y MODAL ---

  agregarAlCarrito(producto: Producto) {
    // 1. Verificar si el usuario tiene un token guardado (está logueado)
    const token = localStorage.getItem('token');

    if (!token) {
      // 2. Si NO hay token, abrir el modal de login
      this.abrirLoginModal();
      return; 
    }

    // 3. Si SÍ hay token, permitir la acción (aquí iría la lógica real del carrito)
    alert(`¡${producto.nombre} agregado al carrito!`);
  }

  // Método auxiliar para abrir el modal usando Bootstrap
  abrirLoginModal() {
    const modalElement = document.getElementById('loginModal');
    if (modalElement) {
      // Si ya existe una instancia, la usamos; si no, creamos una nueva
      this.loginModal = new bootstrap.Modal(modalElement);
      this.loginModal.show();
    }
  }

  // ESTA ES LA FUNCIÓN QUE TE FALTABA Y CAUSABA EL ERROR EN EL HTML
  irALogin() {
    // 1. Cerrar el modal si está abierto
    if (this.loginModal) {
      this.loginModal.hide();
    } else {
      // Intento de cierre de respaldo por si se perdió la referencia
      const modalElement = document.getElementById('loginModal');
      if (modalElement) {
        const instance = bootstrap.Modal.getInstance(modalElement);
        if (instance) instance.hide();
      }
    }

    // 2. Limpiar residuos visuales de Bootstrap (el fondo gris oscuro)
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('overflow');

    // 3. Navegar a la pantalla de Login
    this.router.navigate(['/login']);
  }
}