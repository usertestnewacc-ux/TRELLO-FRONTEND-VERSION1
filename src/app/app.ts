import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { WorkspaceService } from './workspace.service';
import { BoardService } from './board.service';
import { Workspace } from './workspace.types';
import { Board } from './board.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, NgFor, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly boardService = inject(BoardService);
  private readonly router = inject(Router);
  protected readonly title = signal('trelloui');

  showProfileMenu = signal(false);
  showAppSwitcher = signal(false);
  showCreateMenu = signal(false);

  // Search
  searchQuery = signal('');
  searchResults = signal<Array<{type: 'workspace' | 'board'; id: string; name: string; subTitle: string}>>([]);
  showSearchResults = signal(false);
  allWorkspaces: Workspace[] = [];
  allBoards: Board[] = [];

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadSearchData();
    }
  }

  async loadSearchData() {
    try {
      this.allWorkspaces = await this.workspaceService.getWorkspaces();
      this.allBoards = await this.boardService.getBoards();
    } catch {}
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    if (!query.trim()) {
      this.searchResults.set([]);
      this.showSearchResults.set(false);
      return;
    }
    const q = query.toLowerCase();
    const results: Array<{type: 'workspace' | 'board'; id: string; name: string; subTitle: string}> = [];
    for (const ws of this.allWorkspaces) {
      if (ws.name.toLowerCase().includes(q)) {
        results.push({ type: 'workspace', id: ws.id, name: ws.name, subTitle: 'Workspace' });
      }
    }
    for (const board of this.allBoards) {
      if (board.name.toLowerCase().includes(q)) {
        const wsName = this.allWorkspaces.find(w => w.id === board.workspaceId)?.name ?? 'Workspace';
        results.push({ type: 'board', id: board.id, name: board.name, subTitle: wsName });
      }
    }
    this.searchResults.set(results.slice(0, 8));
    this.showSearchResults.set(results.length > 0);
  }

  onSearchResultClick(result: {type: 'workspace' | 'board'; id: string}) {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    if (result.type === 'workspace') {
      this.router.navigate(['/workspaces'], { queryParams: { workspaceId: result.id } });
    } else {
      this.router.navigate(['/boards'], { queryParams: { boardId: result.id } });
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu.update(v => !v);
    this.showAppSwitcher.set(false);
    this.showCreateMenu.set(false);
  }

  toggleAppSwitcher(event: Event) {
    event.stopPropagation();
    this.showAppSwitcher.update(v => !v);
    this.showProfileMenu.set(false);
    this.showCreateMenu.set(false);
  }

  toggleCreateMenu(event: Event) {
    event.stopPropagation();
    this.showCreateMenu.update(v => !v);
    this.showProfileMenu.set(false);
    this.showAppSwitcher.set(false);
  }

  closeMenus() {
    this.showProfileMenu.set(false);
    this.showAppSwitcher.set(false);
    this.showCreateMenu.set(false);
    this.showSearchResults.set(false);
  }
}
