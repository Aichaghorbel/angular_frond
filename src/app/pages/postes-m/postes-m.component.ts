import { Component, OnInit, signal, computed } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { CommentService } from '../../services/comment.service';
import { ModerateurService } from '../../services/moderateur.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-postes-m',
  templateUrl: './postes-m.component.html',
  styleUrls: ['./postes-m.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 }),
        animate(
          '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'scale(1) translateY(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'scale(0.95) translateY(20px)', opacity: 0 })
        )
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ height: '0px', opacity: 0, overflow: 'hidden' })
        )
      ])
    ])
  ]
})
export class PostesMComponent implements OnInit {

  posts = signal<any[]>([]);
  isLoading = signal(true);

  // Notification
  notification = signal<{ type: string; message: string } | null>(null);

  // Filters
  searchQuery = signal('');
  statusFilter = signal('all');
  lockFilter = signal('all');
  specificDateFilter = signal<string | null>(null);
  dateSort = signal('recent');
  isFilterOpen = signal(false);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  // View modal
  selectedPost = signal<any | null>(null);
  isViewModalOpen = signal(false);
  isCommentsExpanded = signal(false);

  // Delete post modal
  isDeleteModalOpen = signal(false);
  postIdToDelete = signal<number | null>(null);

  // Delete comment modal
  isDeleteCommentModalOpen = signal(false);
  commentIdToDelete = signal<number | null>(null);

  // Suspend modal
  suspendModalOpen = signal(false);
  userToSuspend = signal<any | null>(null);
  suspendReason = signal('');
  suspendLoading = signal(false);

  filteredPosts = computed(() => {
    let result = this.posts();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter((p: any) =>
        (p.titre?.toLowerCase() || '').includes(query) ||
        (p.contenu?.toLowerCase() || '').includes(query) ||
        (p.user?.pseudo?.toLowerCase() || '').includes(query)
      );
    }

    const status = this.statusFilter();
    if (status !== 'all') {
      result = result.filter((p: any) =>
        status === 'hidden' ? p.is_hidden : !p.is_hidden
      );
    }

    const lock = this.lockFilter();
    if (lock !== 'all') {
      result = result.filter((p: any) =>
        lock === 'locked' ? p.is_locked : !p.is_locked
      );
    }

    const date = this.specificDateFilter();
    if (date) {
      result = result.filter((p: any) => {
        const postDate = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '';
        return postDate === date;
      });
    }

    const sort = this.dateSort();
    result = [...result].sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sort === 'ancien' ? dateA - dateB : dateB - dateA;
    });

    return result;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredPosts().length / this.itemsPerPage);
  });

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private commentService: CommentService,
    private moderateurService: ModerateurService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.postService.getPosts().subscribe({
      next: (data: any) => {
        this.posts.set(Array.isArray(data) ? data : data.posts || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  toggleFilter(): void {
    this.isFilterOpen.update(v => !v);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.lockFilter.set('all');
    this.specificDateFilter.set(null);
    this.dateSort.set('recent');
    this.currentPage.set(1);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onLockFilterChange(value: string): void {
    this.lockFilter.set(value);
    this.currentPage.set(1);
  }

  onSpecificDateFilterChange(value: string): void {
    this.specificDateFilter.set(value || null);
    this.currentPage.set(1);
  }

  onDateSortChange(value: string): void {
    this.dateSort.set(value);
  }

  getCategoryStyles(categorie: any): any {
    if (!categorie) return {};
    const colors: any = {
      'Développement': { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
      'Design': { backgroundColor: '#fdf4ff', color: '#a21caf', borderColor: '#f0abfc' },
      'Marketing': { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' },
      'Business': { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
      'Technologie': { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }
    };
    return colors[categorie.titre] || { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleHide(id: number): void {
    this.postService.toggleHide(id).subscribe({
      next: () => {
        this.posts.update(list =>
          list.map((p: any) => p.id === id ? { ...p, is_hidden: !p.is_hidden } : p)
        );
        this.selectedPost.update(p => p && p.id === id ? { ...p, is_hidden: !p.is_hidden } : p);
        this.notification.set({ type: 'success', message: 'Statut du post mis à jour' });
        setTimeout(() => this.notification.set(null), 3000);
      },
      error: () => {
        this.notification.set({ type: 'error', message: 'Erreur lors de la mise à jour' });
        setTimeout(() => this.notification.set(null), 3000);
      }
    });
  }

  toggleLock(id: number): void {
    this.postService.toggleLock(id).subscribe({
      next: () => {
        this.posts.update(list =>
          list.map((p: any) => p.id === id ? { ...p, is_locked: !p.is_locked } : p)
        );
        this.selectedPost.update(p => p && p.id === id ? { ...p, is_locked: !p.is_locked } : p);
        this.notification.set({ type: 'success', message: 'Verrouillage mis à jour' });
        setTimeout(() => this.notification.set(null), 3000);
      },
      error: () => {
        this.notification.set({ type: 'error', message: 'Erreur lors de la mise à jour' });
        setTimeout(() => this.notification.set(null), 3000);
      }
    });
  }

  openDeleteModal(id: number): void {
    this.postIdToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeletePost(id: number): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.posts.update(list => list.filter((p: any) => p.id !== id));
        this.isDeleteModalOpen.set(false);
        this.postIdToDelete.set(null);
        if (this.selectedPost()?.id === id) {
          this.closeViewModal();
        }
        this.notification.set({ type: 'success', message: 'Post supprimé' });
        setTimeout(() => this.notification.set(null), 3000);
      },
      error: () => {
        this.notification.set({ type: 'error', message: 'Erreur lors de la suppression' });
        setTimeout(() => this.notification.set(null), 3000);
      }
    });
  }

  viewPost(id: number): void {
    const post = this.posts().find((p: any) => p.id === id);
    if (post) {
      this.selectedPost.set(post);
      this.isViewModalOpen.set(true);
      this.isCommentsExpanded.set(false);
    }
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.selectedPost.set(null);
    this.isCommentsExpanded.set(false);
  }

  toggleUserStatus(user: any): void {
    if (!user) return;
    if (user.status === 'suspendu') {
      // Reactivate user - use fallback toggle
      this.moderateurService.toggleStatusFallback(user.id).subscribe({
        next: () => {
          this.posts.update(list =>
            list.map((p: any) =>
              p.user?.id === user.id ? { ...p, user: { ...p.user, status: 'actif' } } : p
            )
          );
          this.selectedPost.update(p =>
            p && p.user?.id === user.id ? { ...p, user: { ...p.user, status: 'actif' } } : p
          );
          this.notification.set({ type: 'success', message: 'Utilisateur réactivé' });
          setTimeout(() => this.notification.set(null), 3000);
        },
        error: () => {
          this.notification.set({ type: 'error', message: 'Erreur lors de la réactivation' });
          setTimeout(() => this.notification.set(null), 3000);
        }
      });
    } else {
      // Open suspend modal
      this.userToSuspend.set(user);
      this.suspendReason.set('');
      this.suspendModalOpen.set(true);
    }
  }

  confirmSuspend(): void {
    const user = this.userToSuspend();
    const reason = this.suspendReason().trim();
    if (!user || !reason) return;

    this.suspendLoading.set(true);
    this.moderateurService.suspend(user.id, reason).subscribe({
      next: () => {
        this.posts.update(list =>
          list.map((p: any) =>
            p.user?.id === user.id ? { ...p, user: { ...p.user, status: 'suspendu' } } : p
          )
        );
        this.selectedPost.update(p =>
          p && p.user?.id === user.id ? { ...p, user: { ...p.user, status: 'suspendu' } } : p
        );
        this.suspendLoading.set(false);
        this.suspendModalOpen.set(false);
        this.userToSuspend.set(null);
        this.suspendReason.set('');
        this.notification.set({ type: 'success', message: 'Utilisateur suspendu' });
        setTimeout(() => this.notification.set(null), 3000);
      },
      error: () => {
        this.suspendLoading.set(false);
        this.notification.set({ type: 'error', message: 'Erreur lors de la suspension' });
        setTimeout(() => this.notification.set(null), 3000);
      }
    });
  }

  getImageUrl(image: string | null): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    return `${baseUrl}/storage/${image}`;
  }

  countLikes(post: any): number {
    if (!post?.reactions) return 0;
    return post.reactions.filter((r: any) => r.type === 'like').length;
  }

  countDislikes(post: any): number {
    if (!post?.reactions) return 0;
    return post.reactions.filter((r: any) => r.type === 'dislike').length;
  }

  getInitial(pseudo: string | undefined): string {
    return (pseudo?.substring(0, 1) || 'U').toUpperCase();
  }

  onPageChanged(page: number): void {
    this.currentPage.set(page);
  }

  openDeleteCommentModal(id: number): void {
    this.commentIdToDelete.set(id);
    this.isDeleteCommentModalOpen.set(true);
  }

  confirmDeleteComment(id: number): void {
    this.commentService.deleteComment(id).subscribe({
      next: () => {
        this.posts.update(list =>
          list.map((p: any) =>
            p.commentaires
              ? { ...p, commentaires: p.commentaires.filter((c: any) => c.id !== id) }
              : p
          )
        );
        this.selectedPost.update(p =>
          p && p.commentaires
            ? { ...p, commentaires: p.commentaires.filter((c: any) => c.id !== id) }
            : p
        );
        this.isDeleteCommentModalOpen.set(false);
        this.commentIdToDelete.set(null);
        this.notification.set({ type: 'success', message: 'Commentaire supprimé' });
        setTimeout(() => this.notification.set(null), 3000);
      },
      error: () => {
        this.notification.set({ type: 'error', message: 'Erreur lors de la suppression' });
        setTimeout(() => this.notification.set(null), 3000);
      }
    });
  }
}

