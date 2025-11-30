import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para las categorías (con soporte para jerarquía)
export interface Categoria {
  idCategoria: number;
  nombre: string;
  idCategoriaPadre?: number | null; // Importante: Puede ser null
  // Propiedad opcional para saber si tiene hijos en el frontend
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
  idCategoria: number; // Dato clave para el filtrado
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  // Apuntando a tu backend local como pediste
  private apiUrl = 'http://localhost:8080/api'; 

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}