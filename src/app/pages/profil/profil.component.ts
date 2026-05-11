import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { CategoryFilterService } from '../../services/category-filter.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  // ✅ USER UNIQUE (source de vérité)
  user: any = null;

  // ✅ POSTS
  userPosts: any[] = [];
  loadingPosts = false;

  // ✅ PASSWORD
  password = '';
  password_confirmation = '';
  hidePassword = true;
  hideConfirm = true;

  // ✅ PASSWORD STRENGTH
  passwordStrength = 0;
  strengthClass = '';
  strengthLabel = '';

  // ✅ EDIT POST
  editingPostId: number | null = null;
  editTitre = '';
  editContenu = '';

  constructor(
    private auth: AuthService,
    private postService: PostService,
    private http: HttpClient,
    private router: Router,
    private categoryFilter: CategoryFilterService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (u) {
        this.loadUserPosts(u.id);
      }
    });
  }

  // HEADERS
  getHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getToken()}`
      })
    };
  }

  // ✅ UPDATE PROFILE
 updateProfile() {
  this.http.put(
    `${environment.apiUrl}/profile`,
    {
      name: this.user.name,
      pseudo: this.user.pseudo
      // ✅ email retiré
    },
    this.getHeaders()
  ).subscribe(() => alert('Profil mis à jour'));
}

  // ✅ UPDATE PASSWORD
  updatePassword() {
    this.http.put(
      `${environment.apiUrl}/update-password`,
      {
        password: this.password,
        password_confirmation: this.password_confirmation
      },
      this.getHeaders()
    ).subscribe(() => {
      alert('Mot de passe modifié');
      this.password = '';
      this.password_confirmation = '';
    });
  }

  // ✅ POSTS
  loadUserPosts(id: number) {
    this.loadingPosts = true;
    this.postService.getPosts(id).subscribe({
      next: posts => {
        this.userPosts = posts;
        this.loadingPosts = false;
      },
      error: () => this.loadingPosts = false
    });
  }

  // ✅ PASSWORD STRENGTH CHECKER
  checkStrength() {
    const val = this.password;
    let score = 0;
    if (val.length >= 8) score += 25;
    if (/[A-Z]/.test(val)) score += 25;
    if (/[0-9]/.test(val)) score += 25;
    if (/[^A-Za-z0-9]/.test(val)) score += 25;
    this.passwordStrength = score;

    if (score === 0) {
      this.strengthClass = '';
      this.strengthLabel = '';
    } else if (score <= 25) {
      this.strengthClass = 'weak';
      this.strengthLabel = 'Faible';
    } else if (score <= 50) {
      this.strengthClass = 'fair';
      this.strengthLabel = 'Moyen';
    } else if (score <= 75) {
      this.strengthClass = 'good';
      this.strengthLabel = 'Bon';
    } else {
      this.strengthClass = 'strong';
      this.strengthLabel = 'Excellent';
    }
  }

  // ✅ EDIT POST METHODS
  startEdit(post: any) {
    this.editingPostId = post.id;
    this.editTitre = post.titre;
    this.editContenu = post.contenu;
  }

  cancelEdit() {
    this.editingPostId = null;
    this.editTitre = '';
    this.editContenu = '';
  }

  saveEdit(post: any) {
    if (!this.editTitre.trim() || !this.editContenu.trim()) return;

    this.postService.updatePost(post.id, {
      titre: this.editTitre,
      contenu: this.editContenu
    }).subscribe({
      next: () => {
        post.titre = this.editTitre;
        post.contenu = this.editContenu;
        this.cancelEdit();
      },
      error: () => alert('Erreur lors de la modification')
    });
  }

  deletePost(post: any) {
    if (!confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.userPosts = this.userPosts.filter(p => p.id !== post.id);
      },
      error: () => alert('Erreur lors de la suppression')
    });
  }

  goToCategory(categoryId?: number): void {
    if (categoryId == null) return;
    this.categoryFilter.setCategory(categoryId);
    this.categoryFilter.openPostForm(categoryId);
    this.router.navigate(['/home']);
  }
}
