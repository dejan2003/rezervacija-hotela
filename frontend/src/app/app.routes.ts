import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Info } from './pages/info/info';
import { authGuard } from './core/auth.guard';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'info',
    component: Info,
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
];
