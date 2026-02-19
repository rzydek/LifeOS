import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'lifeos-garage',
    imports: [CommonModule, RouterLink],
    template: `
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-6">Garage Tools</h1>
        <div class="grid grid-cols-1 check-md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a routerLink="sniper" class="block p-6 border rounded-lg hover:shadow-lg transition-transform transform hover:-translate-y-1">
            <h2 class="text-xl font-bold mb-2">Parts Sniper 🎯</h2>
            <p>Automated OLX Monitoring & AI Rating</p>
          </a>
        </div>
      </div>
    `,
})
export class GarageWelcomeComponent {}
