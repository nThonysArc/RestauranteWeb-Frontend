import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Menu } from './pages/menu/menu';
import { SobreNosotros } from './pages/sobre-nosotros/sobre-nosotros';
import { Delivery } from './pages/delivery/delivery';

export const routes: Routes = [
  { path: '', component: Inicio }, // Página principal
  { path: 'menu', component: Menu },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'delivery', component: Delivery },
  { path: '**', redirectTo: '' } // Redirige cualquier ruta no encontrada a Inicio
];