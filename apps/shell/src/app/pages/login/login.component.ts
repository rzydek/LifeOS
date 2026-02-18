import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ...HlmCardImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {}
