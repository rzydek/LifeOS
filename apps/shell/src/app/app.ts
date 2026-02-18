import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    imports: [RouterModule],
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    protected title = 'shell';

    public ngOnInit(): void {
        document.querySelector('html')?.classList.add('dark');
    }
}
