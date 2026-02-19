import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchConfigComponent } from './search-config/search-config.component';
import { ResultsGridComponent } from './results-grid/results-grid.component';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { PartsSniperService } from './data-access/parts-sniper.service';
import { SearchConfig } from './data-access/parts-sniper.model';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
  selector: 'lifeos-parts-sniper',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    SearchConfigComponent, 
    ResultsGridComponent,
    HlmTabsImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    TranslatePipe
  ],
  templateUrl: './parts-sniper.component.html'
})
export class PartsSniperComponent implements OnInit {
  configs = signal<SearchConfig[]>([]);
  selectedConfigId = signal<string | undefined>(undefined);
  minScore = signal<number>(80);

  private service = inject(PartsSniperService);

  ngOnInit() {
    this.service.getConfigs().subscribe(configs => {
      this.configs.set(configs);
    });
  }

  selectConfig(id: string | undefined) {
    this.selectedConfigId.set(id);
  }
}
