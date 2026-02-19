import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
    lucideLayoutDashboard,
    lucideGalleryVerticalEnd,
    lucideBox,
    lucideBookOpen,
    lucideSettings,
    lucidePackage,
} from '@ng-icons/lucide';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        HlmIconImports,
        HlmSidebarImports,
        NgIcon,
        TranslatePipe,
    ],
    providers: [
        provideIcons({
            lucideLayoutDashboard,
            lucideBox,
            lucideBookOpen,
            lucideSettings,
            lucideGalleryVerticalEnd,
            lucidePackage,
        }),
    ],
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {}
