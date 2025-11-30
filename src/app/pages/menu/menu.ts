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
  
  // URL base del backend para concatenar a las imágenes relativas
  private backendUrl = 'http://localhost:8080';

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('Productos cargados desde Backend:', this.productos);
      },
      error: (err) => {
        console.error('Error al conectar con el backend:', err);
        // Aquí podrías mostrar un mensaje de error visual al usuario
      }
    });
  }

  /**
   * Procesa la URL de la imagen.
   * Si es null o vacía -> Pone una imagen por defecto.
   * Si es una ruta relativa (ej: "/images/foto.jpg") -> Le pega el dominio del backend.
   * Si es una URL completa (http...) -> La deja tal cual.
   */
  getImagenUrl(ruta: string | null): string {
    if (!ruta) {
      return 'assets/img/plato-default.png'; // Asegúrate de tener esta imagen o usa una URL pública
    }
    if (ruta.startsWith('http')) {
      return ruta;
    }
    // Asume que el backend sirve imágenes estáticas o desde un endpoint
    // Si tu backend guarda la ruta como "/api/media/...", esto funcionará:
    return `${this.backendUrl}${ruta}`; 
  }

  agregarAlCarrito(producto: Producto) {
    console.log('Agregando al carrito:', producto.nombre);
    // Aquí implementaremos la lógica del carrito más adelante
  }
}