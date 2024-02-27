import { Routes } from '@angular/router';
import { MapPageComponent } from './pages/map/page/map-page.component';
import { ManagementComponent } from './pages/management/page/management.component';
import { StatsPageComponent } from './pages/stats/stats-page/stats-page.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/page/admin-dashboard.component';
import { superuserGuard } from './guards/superuser.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/segnalazioni',
        pathMatch: 'full'
    },
    {
        path: 'segnalazioni',
        title: 'MUST - Segnalazioni',
        component: MapPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'gestione',
        redirectTo: '/segnalazioni',
        pathMatch: 'full'
    },
    {
        path: 'gestione/:id',
        title: 'MUST - Gestione',
        component: ManagementComponent,
        canActivate: [authGuard]
    },
    {
        path: 'report',
        title: 'MUST - Report',
        component: StatsPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        title: 'MUST - Login',
        component: LoginComponent
    },
    {
        path: 'admin-dashboard',
        title: 'MUST - Admin dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard, superuserGuard]
    }
];