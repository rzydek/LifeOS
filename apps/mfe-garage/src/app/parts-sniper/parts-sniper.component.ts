import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchConfigComponent } from './search-config/search-config.component';
import { ResultsGridComponent } from './results-grid/results-grid.component';

@Component({
  selector: 'lifeos-parts-sniper',
  standalone: true,
  imports: [CommonModule, SearchConfigComponent, ResultsGridComponent],
  templateUrl: './parts-sniper.component.html'
})
export class PartsSniperComponent {}
