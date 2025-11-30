import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngFor
import { ProductoService, Producto } from '../../services/producto.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  // Inyección del servicio
  private productoService = inject(ProductoService);
  
  // Variable para almacenar los productos del backend
  productos: Producto[] = [];

  // Variable de estado para controlar la carga (Solución al "Cargando..." infinito)
  cargando: boolean = true; 
  
  // URL base del backend (Railway) para concatenar a las imágenes relativas
  private backendUrl = 'https://carpeta-backend-production.up.railway.app';

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    // Iniciamos la carga
    this.cargando = true;

    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false; // Terminó la carga con éxito
        console.log('Productos cargados desde Backend:', this.productos);
      },
      error: (err) => {
        console.error('Error al conectar con el backend:', err);
        this.cargando = false; // Terminó la carga (con error), dejamos de mostrar el spinner
      }
    });
  }

  /**
   * Procesa la URL de la imagen.
   * Si es null o vacía -> Pone una imagen por defecto.
   * Si es una ruta relativa (ej: "/api/media/1") -> Le pega el dominio del backend.
   * Si es una URL completa (http...) -> La deja tal cual.
   */
  getImagenUrl(ruta: string | null): string {
    if (!ruta) {
      // Puedes poner una URL de imagen por defecto si no hay foto
      return 'https://via.placeholder.com/300x200?text=Sin+Imagen'; 
    }
    if (ruta.startsWith('http')) {
      return ruta;
    }
    // Concatena el dominio de Railway con la ruta relativa que viene de la BD
    return `${this.backendUrl}${ruta}`; 
  }

  agregarAlCarrito(producto: Producto) {
    console.log('Agregando al carrito:', producto.nombre);
    // Aquí implementaremos la lógica del carrito más adelante
    alert(`¡${producto.nombre} agregado al carrito!`);
  }
}