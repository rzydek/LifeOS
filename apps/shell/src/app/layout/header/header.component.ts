import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { provideIcons } from '@ng-icons/core';
import { lucideUser, lucideMenu, lucideLogOut, lucideSettings } from '@ng-icons/lucide';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    HlmSidebarImports,
    ...HlmAvatarImports,
    ...HlmDropdownMenuImports,
    ...HlmIconImports,
  ],
  providers: [provideIcons({ lucideUser, lucideMenu, lucideLogOut, lucideSettings })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
