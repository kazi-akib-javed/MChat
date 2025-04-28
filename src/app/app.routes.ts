import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: 'chat',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: '',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'barron',
        loadComponent: () => import('./pages/barron/barron.component').then(m => m.BarronComponent)
    },
    {
        path: 'gre-quant',
        loadComponent: () => import('./pages/gre-quant/gre-quant.component').then(m => m.GreQuantComponent)
    }
];
