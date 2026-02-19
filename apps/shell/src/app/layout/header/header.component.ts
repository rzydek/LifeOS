import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { provideIcons } from '@ng-icons/core';
import { lucideUser, lucideMenu, lucideLogOut, lucideSettings, lucideSun, lucideMoon, lucideLanguages } from '@ng-icons/lucide';
import { TranslatePipe } from '@lifeos-nexus/ui';
import { I18nService, ThemeService } from '@lifeos-nexus/data-access';

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
    TranslatePipe
  ],
  providers: [provideIcons({ lucideUser, lucideMenu, lucideLogOut, lucideSettings, lucideSun, lucideMoon, lucideLanguages })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
    i18n = inject(I18nService);
    theme = inject(ThemeService);
}
