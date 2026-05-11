import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CategoryFilterService } from '../../services/category-filter.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  comments: any[] = [];
  likes: any[] = [];

  loading = true;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private categoryFilter: CategoryFilterService
  ) {}

  ngOnInit(): void {
    this.http.get<any>(
      `${environment.apiUrl}/me/history`,
      {
        headers: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      }
    ).subscribe({
      next: (res) => {
        this.comments = res.comments || [];
        this.likes = res.likes || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement historique', err);
        this.loading = false;
      }
    });
  }

  goToCategory(categoryId?: number): void {
    if (categoryId == null) return;
    this.categoryFilter.setCategory(categoryId);
    this.categoryFilter.openPostForm(categoryId);
    this.router.navigate(['/home']);
  }
}
