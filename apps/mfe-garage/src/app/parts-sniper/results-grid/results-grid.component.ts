import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartsSniperService } from '../data-access/parts-sniper.service';
import { ScrapedOffer } from '../data-access/parts-sniper.model';
import { FormsModule } from '@angular/forms';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'lifeos-results-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmTableImports, HlmCheckboxImports, HlmButtonImports],
  templateUrl: './results-grid.component.html'
})
export class ResultsGridComponent implements OnInit {
  offers: ScrapedOffer[] = [];
  onlyGreatDeals = false;

  constructor(private service: PartsSniperService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.service.getOffers(undefined, this.onlyGreatDeals).subscribe((data) => {
      this.offers = data;
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-primary/20 text-primary border-primary/20';
    if (score >= 50) return 'bg-secondary text-secondary-foreground border-secondary';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
