import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartsSniperService } from '../data-access/parts-sniper.service';
import { SearchConfig, Category, Location } from '../data-access/parts-sniper.model';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'lifeos-search-config',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmInputImports, HlmButtonImports, HlmLabel, HlmDialogImports, BrnDialogContent],
  templateUrl: './search-config.component.html'
})
export class SearchConfigComponent implements OnInit {
  configs = signal<SearchConfig[]>([]);
  categories = signal<Category[]>([]);
  locations = signal<Location[]>([]);

  // Temporary state for form selection
  selectedRegionId = signal('');
  selectedCityId = signal('');

  newConfig = signal<Partial<SearchConfig>>({
    query: '',
    categoryId: '',
    locationId: '',
    radius: 0,
    checkInterval: 3600 // 1 hour default
  });
  
  readonly radii = [0, 2, 5, 10, 15, 30, 50, 75, 100];

  // Dialog States
  categoryDialogState = signal<'open' | 'closed'>('closed');
  locationDialogState = signal<'open' | 'closed'>('closed');

  newCategory = signal<Partial<Category>>({ id: '', name: '' });
  newLocation = signal<Partial<Location>>({ id: '', name: '', type: 'city', parentId: '' });

  regions = computed(() => this.locations().filter(l => l.type === 'region'));

  cities = computed(() => this.locations().filter(l => l.type === 'city'));

  filteredCities = computed(() => {
    // If we select a region, ideally filter cities in that region.
    // If no region selected, show all cities.
    const regionId = this.selectedRegionId();
    if (!regionId) return this.cities();
    
    const inRegion = this.cities().filter(c => c.parentId === regionId);
    return inRegion.length > 0 ? inRegion : this.cities();
  });

  constructor(private service: PartsSniperService) {}

  ngOnInit() {
    this.service.getConfigs().subscribe((data) => this.configs.set(data));
    this.service.getCategories().subscribe((data) => this.categories.set(data));
    this.service.getLocations().subscribe((data) => this.locations.set(data));
  }

  addConfig() {
    const config = this.newConfig();
    if (!config.query) return;
    
    // Determine locationId based on selection
    if (this.selectedCityId()) {
        config.locationId = this.selectedCityId();
    } else if (this.selectedRegionId()) {
        config.locationId = this.selectedRegionId();
    } else {
        config.locationId = '';
    }

    this.service.createConfig(config).subscribe((created) => {
      this.configs.update(c => [...c, created]);
      this.newConfig.set({ query: '', categoryId: '', locationId: '', radius: 0, checkInterval: 3600 });
      this.selectedCityId.set('');
      this.selectedRegionId.set('');
    });
  }

  deleteConfig(id: string) {
    this.service.deleteConfig(id).subscribe(() => {
      this.configs.update(c => c.filter((item) => item.id !== id));
    });
  }

  getCategoryName(id: string) {
    return this.categories().find((c) => c.id === id)?.name || id;
  }

  getLocationName(id: string) {
    return this.locations().find((c) => c.id === id)?.name || id;
  }

  selectConfig(config: SearchConfig) {
    // Implement selection logic if needed
    console.log('Selected config:', config);
  }

  // Category Dialog Methods
  openAddCategoryDialog() {
    this.categoryDialogState.set('open');
  }

  closeCategoryDialog() {
    this.categoryDialogState.set('closed');
    this.newCategory.set({ id: '', name: '' });
  }

  saveCategory() {
    const cat = this.newCategory();
    if (!cat.id || !cat.name) return;
    this.service.addCategory(cat as Category).subscribe((created) => {
      this.categories.update(c => [...c, created]);
      this.closeCategoryDialog();
    });
  }

  // Location Dialog Methods
  openAddLocationDialog() {
    this.locationDialogState.set('open');
  }

  closeLocationDialog() {
    this.locationDialogState.set('closed');
    this.newLocation.set({ id: '', name: '', type: 'city', parentId: '' });
  }

  saveLocation() {
    const loc = this.newLocation();
    if (!loc.id || !loc.name) return;
    this.service.addLocation(loc as Location).subscribe((created) => {
      this.locations.update(l => [...l, created]);
      this.closeLocationDialog();
    });
  }

  // Setters for Signals used in template
  setQuery(query: string) {
    this.newConfig.update(c => ({...c, query}));
  }

  setCategoryId(categoryId: string) {
    this.newConfig.update(c => ({...c, categoryId}));
  }

  setRegionId(regionId: string) {
    this.selectedRegionId.set(regionId);
    this.selectedCityId.set('');
  }

  setCityId(cityId: string) {
    this.selectedCityId.set(cityId);
  }

  setRadius(radius: number) {
    this.newConfig.update(c => ({...c, radius}));
  }

  setNewCategoryId(id: string) {
    this.newCategory.update(c => ({...c, id}));
  }

  setNewCategoryName(name: string) {
    this.newCategory.update(c => ({...c, name}));
  }

  setNewLocationId(id: string) {
    this.newLocation.update(l => ({...l, id}));
  }

  setNewLocationName(name: string) {
    this.newLocation.update(l => ({...l, name}));
  }
  
  setNewLocationType(type: 'city' | 'region') { // Cast to correct type or string
    this.newLocation.update(l => ({...l, type: type as any}));
  }

  setNewLocationParent(parentId: string) {
    this.newLocation.update(l => ({...l, parentId}));
  }
}
