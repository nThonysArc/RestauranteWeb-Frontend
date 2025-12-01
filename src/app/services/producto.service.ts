import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// CORRECCIÓN: Usar solo un "../" porque "services" y "environments" son hermanos dentro de "app"
import { environment } from '../environments/environment/environment'; 

export interface Categoria {
  idCategoria: number;
  nombre: string;
  idCategoriaPadre?: number | null; 
  tieneHijos?: boolean; 
}

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
  
  private apiUrl = environment.apiUrl;

  obtenerProductos(): Observable<Producto[]> {
    // CORRECCIÓN: Se añade '/api'
    return this.http.get<Producto[]>(`${this.apiUrl}/api/productos`);
  }

  obtenerCategorias(): Observable<Categoria[]> {
    // CORRECCIÓN: Se añade '/api'
    return this.http.get<Categoria[]>(`${this.apiUrl}/api/categorias`);
  }
}