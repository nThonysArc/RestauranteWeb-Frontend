import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Menu } from './pages/menu/menu';
import { SobreNosotros } from './pages/sobre-nosotros/sobre-nosotros';
import { Delivery } from './pages/delivery/delivery';
import { Login } from './pages/login/login'; 
export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'menu', component: Menu },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'delivery', component: Delivery },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '' }
];