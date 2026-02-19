import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    SearchConfig,
    Category,
    Location,
} from '../../data-access/parts-sniper.model';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

@Component({
    selector: 'lifeos-search-config-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HlmInputImports,
        HlmButtonImports,
        HlmLabelImports,
        HlmIconImports,
        HlmSelectImports,
        BrnSelectImports,
    ],
    providers: [provideIcons({ lucidePlus })],
    templateUrl: './search-config-form.component.html',
})
export class SearchConfigFormComponent {
    categories = input.required<Category[]>();
    locations = input.required<Location[]>();

    configAdded = output<Partial<SearchConfig>>();
    openCategoryDialog = output<void>();
    openLocationDialog = output<void>();

    // Internal model for form state
    newConfig = signal<{
        query: string;
        source: string;
        categoryId: string;
        locationId: string;
        radius: number;
        checkInterval: number;
    }>({
        query: '',
        source: 'olx',
        categoryId: '',
        locationId: '',
        radius: 0,
        checkInterval: 3600,
    });

    selectedRegionId = signal('');
    selectedCityId = signal('');

    readonly radii = [0, 2, 5, 10, 15, 30, 50, 75, 100];

    // Computed
    regions = computed(() =>
        this.locations().filter((l) => l.type === 'region'),
    );
    cities = computed(() => this.locations().filter((l) => l.type === 'city'));

    filteredCities = computed(() => {
        const regionId = this.selectedRegionId();
        if (!regionId) return this.cities();

        const inRegion = this.cities().filter((c) => c.parentId === regionId);
        return inRegion.length > 0 ? inRegion : this.cities();
    });

    add() {
        const config = this.newConfig();
        if (!config.query) return;

        let locationId = '';
        if (this.selectedCityId()) {
            locationId = this.selectedCityId();
        } else if (this.selectedRegionId()) {
            locationId = this.selectedRegionId();
        }

        // Pack OLX specific fields into parameters object
        const parameters: any = {};
        if (config.source === 'olx') {
            parameters.categoryId = config.categoryId;
            parameters.locationId = locationId;
            parameters.radius = config.radius;
        }

        const finalConfig: any = {
            query: config.query,
            source: config.source,
            checkInterval: config.checkInterval,
            parameters: parameters,
        };

        this.configAdded.emit(finalConfig);

        this.newConfig.set({
            query: '',
            source: 'olx',
            categoryId: '',
            locationId: '',
            radius: 0,
            checkInterval: 3600,
        });
        this.selectedCityId.set('');
        this.selectedRegionId.set('');
    }

    setQuery(query: string) {
        this.newConfig.update((c) => ({ ...c, query: query }));
    }

    setSource(source: string) {
        this.newConfig.update((c) => ({ ...c, source: source }));
    }

    setCategoryId(categoryId: string) {
        this.newConfig.update((c) => ({ ...c, categoryId: categoryId }));
    }

    clearCategory(event: Event) {
        event.stopPropagation();
        this.newConfig.update((c) => ({ ...c, categoryId: '' }));
    }

    setRegionId(regionId: string) {
        this.selectedRegionId.set(regionId);
        this.selectedCityId.set('');
    }

    setCityId(cityId: string) {
        this.selectedCityId.set(cityId);
    }

    setRadius(radius: number) {
        this.newConfig.update((c) => ({ ...c, radius: radius }));
    }
}
