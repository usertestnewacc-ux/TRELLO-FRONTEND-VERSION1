import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { CardService } from './card.service';
import { CardItem } from './card.types';

@Component({
  selector: 'cards-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container animate-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">📝 Card Tasks Explorer</h1>
          <p class="page-subtitle">Load a task list column using its ID to explore individual task cards, update details, or assign members.</p>
        </div>
      </div>

      <div class="alert alert-error" *ngIf="message() && !message().includes('successfully')">
        <span>⚠</span> {{ message() }}
      </div>
      <div class="alert alert-success" *ngIf="message() && message().includes('successfully')">
        <span>✔</span> {{ message() }}
      </div>

      <div class="grid-2" style="align-items: start; gap: 24px;">
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Load Cards form -->
          <div class="card">
            <div class="card-header">Select Task List Column</div>
            <div class="card-body">
              <form (ngSubmit)="loadCards()" class="cards-form">
                <div class="form-group">
                  <label class="form-label" for="listId">List GUID</label>
                  <input id="listId" class="form-control" type="text" [(ngModel)]="listId" name="listId" placeholder="e.g. 00000000-0000-0000-0000-000000000000" required />
                </div>
                <button class="btn btn-primary" type="submit">Load Cards</button>
              </form>
            </div>
          </div>

          <!-- Create Card form -->
          <div class="card" *ngIf="listId">
            <div class="card-header">Create New Task Card</div>
            <div class="card-body">
              <form (ngSubmit)="createCard()" class="cards-form">
                <div class="form-group">
                  <label class="form-label" for="newTitle">Task Title</label>
                  <input id="newTitle" class="form-control" type="text" [(ngModel)]="newTitle" name="newTitle" placeholder="What needs to be done?" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="newDescription">Description</label>
                  <textarea id="newDescription" class="form-control" [(ngModel)]="newDescription" name="newDescription" placeholder="Provide extra details..."></textarea>
                </div>
                <div class="grid-2" style="gap: 12px;">
                  <div class="form-group">
                    <label class="form-label" for="newPriority">Priority</label>
                    <select id="newPriority" class="form-control" [(ngModel)]="newPriority" name="newPriority">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="newDueDate">Due Date</label>
                    <input id="newDueDate" class="form-control" type="date" [(ngModel)]="newDueDate" name="newDueDate" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="newAssignedUserId">Assignee</label>
                  <select id="newAssignedUserId" class="form-control" [(ngModel)]="newAssignedUserId" name="newAssignedUserId">
                    <option value="">Unassigned</option>
                    <option *ngFor="let user of users()" [value]="user.id">{{ user.email }}</option>
                  </select>
                </div>
                <button class="btn btn-success" type="submit">Create Task Card</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Task list order and display -->
        <div class="card" *ngIf="cards().length > 0">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Cards in Column</span>
            <button class="btn btn-primary btn-sm" (click)="saveOrder()">Save Order</button>
          </div>
          <div class="card-body">
            <p class="font-sm text-secondary" style="margin-bottom: 14px;">💡 You can drag and drop cards to reorder, then click "Save Order".</p>
            <div class="cards-list-wrapper">
              <div *ngFor="let card of cards(); let i = index"
                   class="card-row-item"
                   [class.drag-over]="draggedIndex === i"
                   draggable="true"
                   (dragstart)="dragStart(card.id)"
                   (dragover)="onDragOver($event, i)"
                   (dragleave)="onDragLeave()"
                   (drop)="onDrop($event, i)">
                
                <div class="card-row-body">
                  <div class="form-group">
                    <input class="form-control border-none-focus font-bold" type="text" [(ngModel)]="card.title" name="title-{{ card.id }}" />
                  </div>
                  <div class="form-group">
                    <textarea class="form-control border-none-focus font-sm" [(ngModel)]="card.description" name="description-{{ card.id }}" placeholder="No description..."></textarea>
                  </div>
                  <div class="card-meta-row font-xs">
                    <div class="form-group select-xs">
                      <label class="form-label">Priority</label>
                      <select class="form-control inline-xs-select" [(ngModel)]="card.priority" name="priority-{{ card.id }}">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div class="form-group select-xs">
                      <label class="form-label">Status</label>
                      <select class="form-control inline-xs-select" [(ngModel)]="card.status" name="status-{{ card.id }}">
                        <option value="ToDo">To Do</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    <div class="form-group select-xs">
                      <label class="form-label">Assignee</label>
                      <select class="form-control inline-xs-select" [(ngModel)]="card.assignedUserId" name="assignedUser-{{ card.id }}">
                        <option value="">Unassigned</option>
                        <option *ngFor="let user of users()" [value]="user.id">{{ user.email }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="card-row-footer">
                  <button class="btn btn-secondary btn-sm" (click)="updateCard(card)">Save Details</button>
                  <a [routerLink]="['/cards', card.id, 'comments']" class="btn btn-ghost btn-sm">💬 Comments</a>
                  <a [routerLink]="['/cards', card.id, 'attachments']" class="btn btn-ghost btn-sm">📎 Attachments</a>
                  <button class="btn btn-danger btn-sm btn-icon-only" (click)="deleteCard(card.id)">🗑</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cards-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cards-list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .card-row-item {
      padding: 16px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
      gap: 12px;
      cursor: grab;
      transition: background var(--transition), border-color var(--transition);
    }
    .card-row-item:active {
      cursor: grabbing;
    }
    .card-row-item.drag-over {
      background: #eff6ff;
      border-color: var(--brand-blue-light);
    }
    .card-row-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .border-none-focus {
      border-color: transparent;
      background: transparent;
      padding: 4px 6px;
    }
    .border-none-focus:focus {
      border-color: var(--border-focus);
      background: white;
    }
    .font-bold {
      font-weight: 700;
    }
    .font-sm {
      font-size: 0.875rem;
    }
    .font-xs {
      font-size: 0.75rem;
    }
    .card-meta-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .select-xs label {
      font-size: 0.65rem;
      margin-bottom: 2px;
    }
    .inline-xs-select {
      height: 28px;
      padding: 2px 6px;
      font-size: 0.78rem;
      border-radius: var(--radius-sm);
    }
    .card-row-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      border-top: 1px solid var(--border-light);
      padding-top: 10px;
    }
  `]
})
export class CardsComponent {
  listId = '';
  newTitle = '';
  newDescription = '';
  newPriority = 'Medium';
  newDueDate = '';
  newAssignedUserId = '';
  cards = signal<CardItem[]>([]);
  users = signal<Array<{ id: string; email: string }>>([]);
  message = signal('');
  draggedIndex: number | null = null;
  private draggedCardId = '';

  constructor(public auth: AuthService, private cardService: CardService) {
    if (auth.isAuthenticated()) {
      this.loadUsers();
    }
  }

  async loadUsers() {
    try {
      const users = await this.auth.fetchUsers();
      this.users.set(users.map((user) => ({ id: user.id, email: user.email })));
    } catch {
      this.users.set([]);
    }
  }

  async loadCards() {
    if (!this.listId.trim()) {
      this.message.set('List ID is required.');
      return;
    }

    this.message.set('');
    try {
      const cards = await this.cardService.getCards(this.listId.trim());
      this.cards.set(cards.sort((a, b) => a.position - b.position));
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async createCard() {
    if (!this.listId.trim() || !this.newTitle.trim()) {
      this.message.set('List ID and title are required.');
      return;
    }

    this.message.set('');
    try {
      const created = await this.cardService.createCard({
        listId: this.listId.trim(),
        title: this.newTitle.trim(),
        description: this.newDescription.trim() || undefined,
        priority: this.newPriority,
        dueDate: this.newDueDate || undefined,
        assignedUserId: this.newAssignedUserId || undefined,
        position: this.cards().length,
        status: 'ToDo'
      });
      this.cards.update((current) => [...current, created].sort((a, b) => a.position - b.position));
      this.newTitle = '';
      this.newDescription = '';
      this.newPriority = 'Medium';
      this.newDueDate = '';
      this.newAssignedUserId = '';
      this.message.set('Task created successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async updateCard(card: CardItem) {
    this.message.set('');
    try {
      const updated = await this.cardService.updateCard(card.id, {
        title: card.title,
        description: card.description,
        priority: card.priority,
        dueDate: card.dueDate,
        assignedUserId: card.assignedUserId || undefined,
        position: card.position,
        status: card.status
      });
      this.cards.update((cards) => cards.map((item) => item.id === updated.id ? updated : item));
      this.message.set('Task updated successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async deleteCard(cardId: string) {
    if (!confirm('Delete this task?')) {
      return;
    }

    this.message.set('');
    try {
      await this.cardService.deleteCard(cardId);
      this.cards.update((cards) => cards.filter((item) => item.id !== cardId));
      this.message.set('Task deleted successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  dragStart(cardId: string) {
    this.draggedCardId = cardId;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    this.draggedIndex = index;
  }

  onDragLeave() {
    this.draggedIndex = null;
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    this.draggedIndex = null;
    const sourceId = this.draggedCardId;
    const sourceIndex = this.cards().findIndex((card) => card.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      return;
    }

    this.cards.update((cards) => {
      const updated = [...cards];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated.map((card, index) => ({ ...card, position: index }));
    });
  }

  async saveOrder() {
    if (!this.listId.trim()) {
      this.message.set('List ID is required to save order.');
      return;
    }

    this.message.set('');
    try {
      const reordered = await this.cardService.reorderCards({
        listId: this.listId.trim(),
        items: this.cards().map((card) => ({ cardId: card.id, listId: card.listId, position: card.position }))
      });
      this.cards.set(reordered.sort((a, b) => a.position - b.position));
      this.message.set('Task order saved successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }
}

