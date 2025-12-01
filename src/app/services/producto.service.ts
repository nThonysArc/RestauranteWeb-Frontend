import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para las categorías
export interface Categoria {
  idCategoria: number;
  nombre: string;
  idCategoriaPadre?: number | null; 
  tieneHijos?: boolean; 
}

// Interfaz para los productos
export interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoriaNombre: string;
  idCategoria: number; 
}

// ELIMINADO: export interface ItemCarrito... (Ya está en carrito.service.ts)

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:8080/api'; 

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}