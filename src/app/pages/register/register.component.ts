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

  // Validation en temps réel
  nameError = '';
  pseudoError = '';
  emailError = '';
  passwordError = '';
  confirmError = '';

  // Password strength
  passwordStrength = 0;
  strengthClass = '';
  strengthLabel = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // =========================
  // VALIDATION CHAMP PAR CHAMP
  // =========================
  validateName(): void {
    this.nameError = !this.name.trim() ? 'Le nom est obligatoire.' : '';
  }

  validatePseudo(): void {
    this.pseudoError = !this.pseudo.trim() ? 'Le pseudo est obligatoire.' : '';
  }

  validateEmail(): void {
    if (!this.email.trim()) {
      this.emailError = "L'email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.emailError = "L'adresse email n'est pas valide.";
    } else {
      this.emailError = '';
    }
  }

  validatePassword(): void {
    if (!this.password) {
      this.passwordError = 'Le mot de passe est obligatoire.';
    } else if (this.password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères.';
    } else {
      this.passwordError = '';
    }
    this.checkStrength();
    if (this.confirmPassword) this.validateConfirm();
  }

  validateConfirm(): void {
    if (!this.confirmPassword) {
      this.confirmError = 'La confirmation est obligatoire.';
    } else if (this.password !== this.confirmPassword) {
      this.confirmError = 'Les mots de passe ne correspondent pas.';
    } else {
      this.confirmError = '';
    }
  }

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

  // Vérifie si un champ est rempli (pour le style rouge)
  isFieldEmpty(value: string): boolean {
    return value.trim() === '';
  }

  handleSubmit(event: Event): void {
    event.preventDefault();

    // Valider tous les champs avant envoi
    this.validateName();
    this.validatePseudo();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirm();

    // Arrêter si erreurs locales
    if (
      this.nameError || this.pseudoError ||
      this.emailError || this.passwordError || this.confirmError
    ) {
      this.error.set('Veuillez corriger les erreurs ci-dessus.');
      return;
    }

    this.error.set('');
    this.isSubmitting.set(true);

    const payload = {
      name: this.name.trim(),
      pseudo: this.pseudo.trim(),
      email: this.email.trim(),
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

        // Erreurs de validation Laravel (422)
        if (err?.error?.errors) {
          const errors = err.error.errors;

          if (errors.email) {
            this.emailError = 'Cet email est déjà utilisé.';
            this.error.set('Cet email est déjà utilisé par un autre compte.');
          } else if (errors.pseudo) {
            this.pseudoError = 'Ce pseudo est déjà pris.';
            this.error.set('Ce pseudo est déjà utilisé par un autre compte.');
          } else {
            const firstError = Object.values(errors)[0] as string[];
            this.error.set(firstError[0]);
          }
          return;
        }

        // Erreur générique backend
        const msg = err?.error?.message || err?.error?.error || '';
        if (/email/i.test(msg)) {
          this.emailError = 'Cet email est déjà utilisé.';
          this.error.set('Cet email est déjà utilisé par un autre compte.');
        } else if (/pseudo/i.test(msg)) {
          this.pseudoError = 'Ce pseudo est déjà pris.';
          this.error.set('Ce pseudo est déjà utilisé.');
        } else {
          this.error.set(msg || "Erreur lors de l'inscription. Veuillez réessayer.");
        }
      }
    });
  }
}