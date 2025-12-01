import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importamos environment para usar la URL correcta según estemos en local o prod
import { environment } from 'environments/environment'; 

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

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  // CAMBIO: Usamos la variable del environment en lugar de hardcodear localhost
  private apiUrl = environment.apiUrl;

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}