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
  
  // "Base de datos" en memoria del navegador
  todosLosProductos: Producto[] = [];
  todasLasCategorias: Categoria[] = [];

  // Lo que ve el usuario
  productosFiltrados: Producto[] = [];
  categoriasPrincipales: Categoria[] = []; 

  // Filtros
  textoBusqueda: string = '';
  idCategoriaSeleccionada: number = -1; // -1 = Todas

  cargando: boolean = true; 
  errorCarga: boolean = false;
  
  // URL base para imágenes (Local)
  private backendUrl = 'http://localhost:8080';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    
    // Carga paralela de Productos y Categorías
    forkJoin({
      productos: this.productoService.obtenerProductos(),
      categorias: this.productoService.obtenerCategorias()
    }).subscribe({
      next: (res) => {
        this.todosLosProductos = res.productos;
        this.todasLasCategorias = res.categorias;
        
        // 1. Filtramos solo las categorías PADRE (las que no tienen idCategoriaPadre)
        // Esto llena el Select con "Entradas", "Fondos", etc.
        this.categoriasPrincipales = this.todasLasCategorias
          .filter(c => !c.idCategoriaPadre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        // 2. Mostramos todo al inicio
        this.productosFiltrados = this.todosLosProductos;
        
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error conectando a localhost:', err);
        this.errorCarga = true;
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    const texto = this.textoBusqueda.toLowerCase();
    
    this.productosFiltrados = this.todosLosProductos.filter(producto => {
      // --- A. FILTRO POR TEXTO ---
      const coincideTexto = producto.nombre.toLowerCase().includes(texto) || 
                            (producto.descripcion && producto.descripcion.toLowerCase().includes(texto));

      // --- B. FILTRO POR CATEGORÍA (Lógica de Escritorio) ---
      let coincideCategoria = true;
      
      if (this.idCategoriaSeleccionada !== -1) {
        // Opción 1: El producto pertenece DIRECTAMENTE a la categoría seleccionada (ej: Bebidas -> Inka Cola)
        const esDirecta = producto.idCategoria === this.idCategoriaSeleccionada;
        
        // Opción 2: El producto pertenece a una SUBCATEGORÍA de la seleccionada (ej: Entradas -> Entradas Frías -> Causa)
        // Buscamos la categoría del producto en la lista completa
        const catDelProducto = this.todasLasCategorias.find(c => c.idCategoria === producto.idCategoria);
        // Verificamos si su padre es la categoría seleccionada en el filtro
        const esHija = catDelProducto && catDelProducto.idCategoriaPadre === this.idCategoriaSeleccionada;

        coincideCategoria = esDirecta || Boolean(esHija);
      }

      return coincideTexto && coincideCategoria;
    });
  }

  getImagenUrl(ruta: string | null): string {
    if (!ruta) return 'https://via.placeholder.com/300x200?text=Sin+Imagen'; 
    if (ruta.startsWith('http')) return ruta;
    // Concatena http://localhost:8080 + /api/media/123...
    return `${this.backendUrl}${ruta}`; 
  }

  agregarAlCarrito(producto: Producto) {
    // Aquí iría tu lógica de carrito real
    alert(`¡${producto.nombre} agregado al carrito!`);
  }
}