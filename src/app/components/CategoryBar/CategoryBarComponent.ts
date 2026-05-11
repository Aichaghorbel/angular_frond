import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryFilterService } from '../../services/category-filter.service';

export interface Categorie {
  id: number;
  titre: string;
  description?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-category-bar',
  templateUrl: './CategoryBarComponent.html',
  styleUrls: ['./CategoryBarComponent.css']
})
export class CategoryBarComponent implements OnInit {

  categories: Categorie[] = [];
  selectedCategoryId: number | null = null;

  @Output() categorySelected = new EventEmitter<number | null>();

  constructor(
    private categoryService: CategoryFilterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    // ✅ Synchronise la catégorie active avec l’URL
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category']
        ? Number(params['category'])
        : null;
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: Categorie[]) => {
        this.categories = res || [];
      },
      error: err => console.error('ERROR CATEGORIES', err)
    });
  }

  // ✅ REDIRECTION VERS HOME AVEC CATÉGORIE
  selectCategory(cat: Categorie | null): void {
    const categoryId = cat ? cat.id : null;
    this.selectedCategoryId = categoryId;

    this.router.navigate(['/home'], {
      queryParams: categoryId ? { category: categoryId } : {}
    });

    this.categoryService.setCategory(categoryId);
    this.categorySelected.emit(categoryId);
  }

  isActive(catId: number | null): boolean {
    return this.selectedCategoryId === catId;
  }

  trackByCategory(index: number, cat: Categorie): number {
    return cat.id;
  }

  getColor(color?: string): string {
    if (!color) return '#2563eb';
    return color.startsWith('#') ? color : `#${color}`;
  }
}
