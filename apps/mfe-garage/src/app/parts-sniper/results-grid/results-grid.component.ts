import { Component, input, inject, signal, effect, untracked, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartsSniperService } from '../data-access/parts-sniper.service';
import { ScrapedOffer } from '../data-access/parts-sniper.model';
import { ResultsTableComponent } from './components/results-table.component';
import { OfferDetailsSheetComponent } from './components/offer-details-sheet.component';

@Component({
  selector: 'lifeos-results-grid',
  standalone: true,
  imports: [CommonModule, ResultsTableComponent, OfferDetailsSheetComponent],
  templateUrl: './results-grid.component.html'
})
export class ResultsGridComponent {
  private service = inject(PartsSniperService);
  private detailsSheet = viewChild<OfferDetailsSheetComponent>('detailsSheet');

  configId = input<string | undefined>();
  minScore = input<number>(0);

  offers = signal<ScrapedOffer[]>([]);
  selectedOffer = signal<ScrapedOffer | null>(null);

  constructor() {
    effect(() => {
      const id = this.configId();
      const score = this.minScore();
      untracked(() => this.refresh(id, score));
    });
  }

  openSheet(offer: ScrapedOffer) {
    this.selectedOffer.set(offer);
    this.detailsSheet()?.open();
  }

  refresh(configId = this.configId(), minScore = this.minScore()) {
    this.service.getOffers(configId, minScore).subscribe((data) => {
      this.offers.set(data);
    });
  }
}
