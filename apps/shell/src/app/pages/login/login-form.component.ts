import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

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
    private readonly _authService = inject(AuthService);

	public form = this._fb.nonNullable.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]],
	});

	public login() {
		if (this.form.valid) {
			const { email, password } = this.form.getRawValue();
            this._authService.login({ email, password }).subscribe({
                error: (err) => console.error('Login failed', err),
            });
		}
	}
}

