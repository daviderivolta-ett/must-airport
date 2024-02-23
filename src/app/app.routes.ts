import { Routes } from '@angular/router';
import { MapPageComponent } from './pages/map/page/map-page.component';
import { ManagementComponent } from './pages/management/page/management.component';
import { StatsPageComponent } from './pages/stats/stats-page/stats-page.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/segnalazioni',
        pathMatch: 'full'
    },
    {
        path: 'segnalazioni',
        title: 'MUST Airport - Segnalazioni',
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
        title: 'MUST Airport - Gestione',
        component: ManagementComponent,
        canActivate: [authGuard]
    },
    {
        path: 'report',
        title: 'MUST Airport - Report',
        component: StatsPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        title: 'MUST Airport - Login',
        component: LoginComponent
    }
];