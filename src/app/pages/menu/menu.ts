import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; 
import { ProductoService, Producto, Categoria } from '../../services/producto.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  private productoService = inject(ProductoService);
  
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

  agregarAlCarrito(producto: Producto) {
    alert(`¡${producto.nombre} agregado al carrito!`);
  }
}