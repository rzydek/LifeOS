import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-login-form',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule, 
		RouterLink, 
		HlmCardImports, 
		HlmFieldImports, 
		HlmInputImports, 
		HlmButtonImports
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
	private readonly _fb = inject(FormBuilder);

	public form = this._fb.nonNullable.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(8)]],
	});

	public login() {
		if (this.form.valid) {
			// login logic here
			console.log(this.form.value);
		}
	}
}
