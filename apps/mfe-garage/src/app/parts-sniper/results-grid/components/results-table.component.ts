import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrapedOffer } from '../../data-access/parts-sniper.model';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { provideIcons } from '@ng-icons/core';
import { lucideRefreshCw } from '@ng-icons/lucide';

@Component({
  selector: 'lifeos-results-table',
  standalone: true,
  imports: [CommonModule, HlmTableImports, HlmButtonImports, HlmIconImports, HlmTooltipImports],
  providers: [provideIcons({ lucideRefreshCw })],
  templateUrl: './results-table.component.html',
})
export class ResultsTableComponent {
  offers = input.required<ScrapedOffer[]>();
  offerSelected = output<ScrapedOffer>();
  refresh = output<void>();

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-[oklch(0.43_0.09_167)] text-white border-transparent';
    if (score >= 50) return 'bg-secondary text-secondary-foreground border-secondary';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
