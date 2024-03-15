import { Routes } from '@angular/router';
import { MapPageComponent } from './pages/map/page/map-page.component';
import { ManagementComponent } from './pages/management/page/management.component';
import { StatsPageComponent } from './pages/stats/stats-page/stats-page.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/page/admin-dashboard.component';
import { superuserGuard } from './guards/superuser.guard';
import { UseCodeComponent } from './pages/use-code/use-code.component';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';
import { ArchiveComponent } from './pages/archive/page/archive.component';

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
        // canActivate: [authGuard]
    },
    {
        path: 'gestione',
        redirectTo: '/segnalazioni',
        pathMatch: 'full',
    },
    {
        path: 'gestione/:id',
        title: 'MUST - Gestione',
        component: ManagementComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'report',
        title: 'MUST - Report',
        component: StatsPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'archivio',
        title: 'MUST - Archivio',
        component: ArchiveComponent,
        canActivate: [adminGuard]
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
        canActivate: [superuserGuard]
    },
    {
        path: 'use-code',
        title: 'MUST - Usa codice',
        component: UseCodeComponent,
        canActivate: [userGuard]
    }
];