import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchConfig, Category, Location } from '../../data-access/parts-sniper.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideClock, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'lifeos-search-config-list',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, HlmIconImports],
  providers: [provideIcons({ lucideClock, lucideX })],
  templateUrl: './search-config-list.component.html'
})
export class SearchConfigListComponent {
  configs = input.required<SearchConfig[]>();
  categories = input.required<Category[]>();
  locations = input.required<Location[]>();
  
  configSelected = output<SearchConfig>();
  configDeleted = output<string>();

  getCategoryName(id: string) {
    return this.categories().find((c) => c.id === id)?.name || id;
  }

  getLocationName(id: string) {
    return this.locations().find((c) => c.id === id)?.name || id;
  }

  getRegionName(locationId: string) {
    const location = this.locations().find((l) => l.id === locationId);
    if (!location || !location.parentId) return null;
    return this.locations().find((l) => l.id === location.parentId)?.name;
  }
}
