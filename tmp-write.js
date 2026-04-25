const fs = require('fs');
const content = `<div class="register-page">
  <div class="register-card">

    <!-- HEADER -->
    <div class="register-header">
      <img src="assets/2.png" alt="HIDETALK" class="register-logo">
      <h1>Créer un compte</h1>
      <p>Rejoignez la communauté HideTalk</p>
    </div>

    <!-- ERREUR -->
    <div *ngIf="error()" class="error-box">
      <mat-icon>error_outline</mat-icon>
      <span>{{ error() }}</span>
    </div>

    <!-- FORMULAIRE -->
    <form (submit)="handleSubmit($event)" class="register-form">

      <!-- NOM -->
      <div class="input-group">
        <label class="input-label">Nom complet</label>
        <div class="input-wrap">
          <mat-icon class="input-icon">person</mat-icon>
          <input type="text" [(ngModel)]="name" name="name" class="native-input" placeholder="Votre nom complet" required />
        </div>

      <!-- PSEUDO -->
      <div class="input-group">
        <label class="input-label">Pseudo</label>
        <div class="input-wrap">
          <mat-icon class="input-icon">alternate_email</mat-icon>
          <input type="text" [(ngModel)]="pseudo" name="pseudo" class="native-input" placeholder="Choisissez un pseudo" required />
        </div>

      <!-- EMAIL -->
      <div class="input-group">
        <label class="input-label">Adresse email</label>
        <div class="input-wrap">
          <mat-icon class="input-icon">email</mat-icon>
          <input type="email" [(ngModel)]="email" name="email" class="native-input" placeholder="votre@email.com" required />
        </div>

      <!-- MOT DE PASSE -->
      <div class="input-group">
        <label class="input-label">Mot de passe</label>
        <div class="input-wrap">
          <mat-icon class="input-icon">lock</mat-icon>
          <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" (input)="checkStrength()" class="native-input" placeholder="Mot de passe" required />
          <button type="button" class="toggle-eye" (click)="showPassword = !showPassword">
            <mat-icon>{{ showPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
        </div>

      <!-- Force du mot de passe -->
      <div class="strength-meter" *ngIf="password">
        <div class="strength-bar">
          <span class="strength-fill" [style.width.%]="passwordStrength" [class]="strengthClass"></span>
        </div>
        <span class="strength-label" [class]="strengthClass + '-text'">{{ strengthLabel }}</span>
      </div>

      <!-- CONFIRMATION -->
      <div class="input-group">
        <label class="input-label">Confirmation du mot de passe</label>
        <div class="input-wrap">
          <mat-icon class="input-icon">lock_outline</mat-icon>
          <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="native-input" placeholder="Confirmez le mot de passe" required />
          <button type="button" class="toggle-eye" (click)="showConfirm = !showConfirm">
            <mat-icon>{{ showConfirm ? 'visibility' : 'visibility_off' }}</mat-icon>
          </button>
        </div>

      <!-- SUBMIT -->
      <button type="submit" [disabled]="isSubmitting()" class="submit-btn">
        <span *ngIf="isSubmitting()" class="spinner"></span>
        {{ isSubmitting() ? 'Inscription...' : 'S\\'inscrire' }}
      </button>

    </form>

    <!-- LIEN LOGIN -->
    <div class="register-footer">
      <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
    </div>
</div>`;
fs.writeFileSync('src/app/pages/register/register.component.html', content, 'utf8');
console.log('File written successfully');
