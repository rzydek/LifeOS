import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
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
        path: 'mfeGarage',
        loadChildren: () =>
            import('mfeGarage/Routes').then((m) => m!.remoteRoutes),
    },
    {
        path: '',
        component: NxWelcome,
    },
];
