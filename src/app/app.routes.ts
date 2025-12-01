import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Menu } from './pages/menu/menu';
import { SobreNosotros } from './pages/sobre-nosotros/sobre-nosotros';
import { Login } from './login/login';
import { Registro } from './pages/registro/registro';
import { CarritoComponent } from './pages/carrito/carrito'; // Nueva
import { PerfilComponent } from './pages/perfil/perfil';   // Nueva

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'menu', component: Menu },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'carrito', component: CarritoComponent }, // Nueva ruta
  { path: 'perfil', component: PerfilComponent },   // Nueva ruta
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: '**', redirectTo: '' }
];