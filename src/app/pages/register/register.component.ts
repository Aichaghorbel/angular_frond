import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  pseudo = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  isSubmitting = signal(false);
  showPassword = false;
  showConfirm = false;

  // Password strength
  passwordStrength = 0;
  strengthClass = '';
  strengthLabel = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  checkStrength(): void {
    const pwd = this.password;
    if (!pwd) {
      this.passwordStrength = 0;
      this.strengthClass = '';
      this.strengthLabel = '';
      return;
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) {
      this.passwordStrength = 25;
      this.strengthClass = 'weak';
      this.strengthLabel = 'Faible';
    } else if (score === 3) {
      this.passwordStrength = 50;
      this.strengthClass = 'fair';
      this.strengthLabel = 'Moyen';
    } else if (score === 4) {
      this.passwordStrength = 75;
      this.strengthClass = 'good';
      this.strengthLabel = 'Bon';
    } else {
      this.passwordStrength = 100;
      this.strengthClass = 'strong';
      this.strengthLabel = 'Fort';
    }
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.name || !this.pseudo || !this.email || !this.password) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.error.set('');
    this.isSubmitting.set(true);

    const payload = {
      name: this.name,
      pseudo: this.pseudo,
      email: this.email,
      password: this.password,
      password_confirmation: this.confirmPassword
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        if (err?.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.error.set(firstError[0]);
        } else {
          this.error.set(err?.error?.error || err?.error?.message || "Erreur lors de l'inscription");
        }
      }
    });
  }
}
