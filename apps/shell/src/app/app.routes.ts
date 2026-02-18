import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { NxWelcome } from './nx-welcome';

export const appRoutes: Route[] = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'mfeKnowledge',
                loadChildren: () =>
                    import('mfeKnowledge/Routes').then((m) => m!.remoteRoutes),
            },
            {
                path: 'mfeFamily',
                loadChildren: () =>
                    import('mfeFamily/Routes').then((m) => m!.remoteRoutes),
            },
            {
                path: 'garage',
                loadChildren: () =>
                    import('mfeGarage/Routes').then((m) => m!.remoteRoutes),
            },
            {
                path: '',
                component: NxWelcome,
            },
        ],
    },
];
