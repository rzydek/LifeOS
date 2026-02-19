import { Component, OnInit, signal, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartsSniperService } from '../data-access/parts-sniper.service';
import { SearchConfig, Category, Location } from '../data-access/parts-sniper.model';
import { SearchConfigListComponent } from './components/search-config-list.component';
import { SearchConfigFormComponent } from './components/search-config-form.component';
import { AddCategoryDialogComponent } from './components/add-category-dialog.component';
import { AddLocationDialogComponent } from './components/add-location-dialog.component';

@Component({
  selector: 'lifeos-search-config',
  standalone: true,
  imports: [
    CommonModule, 
    SearchConfigListComponent, 
    SearchConfigFormComponent, 
    AddCategoryDialogComponent, 
    AddLocationDialogComponent
  ],
  templateUrl: './search-config.component.html'
})
export class SearchConfigComponent implements OnInit {
  private service = inject(PartsSniperService);
  
  categoryDialog = viewChild<AddCategoryDialogComponent>('categoryDialog');
  locationDialog = viewChild<AddLocationDialogComponent>('locationDialog');

  configs = signal<SearchConfig[]>([]);
  categories = signal<Category[]>([]);
  locations = signal<Location[]>([]);

  regions = computed(() => this.locations().filter(l => l.type === 'region'));

  ngOnInit() {
    this.service.getConfigs().subscribe((data) => this.configs.set(data));
    this.service.getCategories().subscribe((data) => this.categories.set(data));
    this.service.getLocations().subscribe((data) => this.locations.set(data));
  }

  onAddConfig(config: Partial<SearchConfig>) {
    this.service.createConfig(config).subscribe((created) => {
      this.configs.update(c => [...c, created]);
    });
  }

  onDeleteConfig(id: string) {
    this.service.deleteConfig(id).subscribe(() => {
      this.configs.update(c => c.filter((item) => item.id !== id));
    });
  }

  openAddCategoryDialog() {
    this.categoryDialog()?.open();
  }

  onCategoryAdded(category: Partial<Category>) {
    this.service.addCategory(category as Category).subscribe((created) => {
      this.categories.update(c => [...c, created]);
    });
  }

  openAddLocationDialog() {
    this.locationDialog()?.open();
  }

  onLocationAdded(location: Partial<Location>) {
    this.service.addLocation(location as Location).subscribe((created) => {
      this.locations.update(l => [...l, created]);
    });
  }
}

