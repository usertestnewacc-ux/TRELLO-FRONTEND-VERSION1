import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { WorkspaceService } from './workspace.service';
import { Workspace, WorkspaceMember } from './workspace.types';

@Component({
  selector: 'workspaces-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container animate-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">💼 Workspaces</h1>
          <p class="page-subtitle font-sm">Collaborate with your team by creating workspaces and boards.</p>
        </div>
        <div>
          <button class="btn btn-primary" (click)="showCreateModal.set(true)">
            <span>➕</span> Create Workspace
          </button>
        </div>
      </div>

      <div class="alert alert-error" *ngIf="message() && !message().includes('successfully')">
        <span>⚠</span> {{ message() }}
      </div>
      <div class="alert alert-success" *ngIf="message() && message().includes('successfully')">
        <span>✔</span> {{ message() }}
      </div>

      <!-- Main Layout -->
      <div class="workspace-grid-layout">
        <!-- Workspaces list -->
        <div class="workspaces-section">
          <div class="section-header-row">
            <h2>Your Workspaces</h2>
            <button class="btn btn-ghost btn-sm" (click)="loadWorkspaces()" [disabled]="isLoading()">
              <span class="spinner spinner-dark" *ngIf="isLoading()"></span>
              <span *ngIf="!isLoading()">🔄 Refresh</span>
            </button>
          </div>

          <div *ngIf="workspaces().length === 0 && !isLoading()" class="card empty-state">
            <span class="empty-state-icon">💼</span>
            <h3>No workspaces yet</h3>
            <p>Create a workspace to begin organizing your project boards.</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 12px;" (click)="showCreateModal.set(true)">
              Create Workspace
            </button>
          </div>

          <div class="grid-2" *ngIf="workspaces().length > 0">
            <div *ngFor="let workspace of workspaces()" 
                 class="card workspace-card" 
                 [class.active-card]="workspace.id === selectedWorkspace()?.id"
                 (click)="selectWorkspace(workspace)">
              <div class="card-body">
                <div class="workspace-card-icon">
                  {{ workspace.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="workspace-card-info">
                  <h3>{{ workspace.name }}</h3>
                  <p>{{ workspace.description || 'No description provided.' }}</p>
                </div>
                <div class="workspace-card-actions" (click)="$event.stopPropagation()">
                  <button class="btn btn-secondary btn-sm" (click)="selectWorkspace(workspace)">Manage</button>
                  <button class="btn btn-danger btn-sm btn-icon-only" (click)="deleteWorkspace(workspace.id)" title="Delete workspace">🗑</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Workspace details -->
        <div class="details-section" *ngIf="selectedWorkspace()">
          <div class="card selected-workspace-card animate-in">
            <div class="card-header">
              <div class="workspace-header-details">
                <span class="badge badge-blue">Selected</span>
                <h2>{{ selectedWorkspace()?.name }}</h2>
              </div>
            </div>
            <div class="card-body">
              <!-- Edit details -->
              <form (ngSubmit)="updateWorkspace()" class="workspace-edit-form">
                <div class="form-group">
                  <label class="form-label" for="editName">Workspace Name</label>
                  <input id="editName" class="form-control" type="text" [(ngModel)]="editName" name="editName" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="editDescription">Description</label>
                  <textarea id="editDescription" class="form-control" [(ngModel)]="editDescription" name="editDescription" placeholder="Optional description"></textarea>
                </div>
                <button class="btn btn-primary" type="submit">Update Details</button>
              </form>

              <hr class="divider" />

              <!-- Members section -->
              <div class="members-section">
                <div class="section-header-row">
                  <h3>Workspace Members</h3>
                  <button class="btn btn-ghost btn-sm" (click)="loadMembers()">
                    🔄 Refresh Members
                  </button>
                </div>

                <div *ngIf="members().length === 0" class="empty-state-small">
                  No members in this workspace yet.
                </div>

                <div class="member-list-wrapper" *ngIf="members().length > 0">
                  <div *ngFor="let member of members()" class="member-row">
                    <div class="member-info">
                      <div class="avatar avatar-sm avatar-member">
                        {{ member.email?.substring(0, 2)?.toUpperCase() || 'U' }}
                      </div>
                      <div>
                        <span class="member-email">{{ member.email || member.userId }}</span>
                        <span class="member-role-badge badge" 
                              [class.badge-blue]="member.role === 'Admin'"
                              [class.badge-green]="member.role === 'Editor'"
                              [class.badge-yellow]="member.role === 'Viewer'"
                              [class.badge-gray]="member.role === 'Member' || !member.role">
                          {{ member.role || 'Member' }}
                        </span>
                      </div>
                    </div>
                    <div class="member-actions">
                      <select class="form-control inline-select" [(ngModel)]="member.role" name="role-{{ member.id }}">
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      <button class="btn btn-secondary btn-sm" (click)="updateMemberRole(member)" title="Save Role">💾</button>
                      <button class="btn btn-danger btn-sm btn-icon-only" (click)="removeMember(member.id)" title="Remove Member">✕</button>
                    </div>
                  </div>
                </div>

                <!-- Invite Member Form -->
                <div class="card invite-member-card">
                  <div class="card-body">
                    <h4>➕ Invite Team Member</h4>
                    <form (ngSubmit)="inviteMember()" class="invite-member-form">
                      <div class="form-group">
                        <label class="form-label" for="inviteEmail">User Email</label>
                        <input id="inviteEmail" class="form-control" type="email" [(ngModel)]="newInviteEmail" name="newInviteEmail" placeholder="colleague@trello.local" required />
                      </div>
                      <div class="form-group">
                        <label class="form-label" for="inviteRole">Workspace Role</label>
                        <select id="inviteRole" class="form-control" [(ngModel)]="newInviteRole" name="newInviteRole">
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>
                      <button class="btn btn-success" type="submit">Send Invitation</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal()">
        <div class="modal animate-in">
          <div class="modal-header">
            <span class="modal-title">Create New Workspace</span>
            <button class="btn-icon" (click)="showCreateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="createWorkspace()">
            <div class="modal-body">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" for="newName">Workspace Name</label>
                <input id="newName" class="form-control" type="text" [(ngModel)]="newName" name="newName" placeholder="e.g. Marketing Team" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="newDescription">Description</label>
                <textarea id="newDescription" class="form-control" [(ngModel)]="newDescription" name="newDescription" placeholder="What does this workspace do?"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" (click)="showCreateModal.set(false)">Cancel</button>
              <button class="btn btn-primary" type="submit">Create Workspace</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workspace-grid-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      margin-top: 16px;
    }
    @media (max-width: 900px) {
      .workspace-grid-layout {
        grid-template-columns: 1fr;
      }
    }
    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-header-row h2 {
      font-size: 1.25rem;
      color: var(--text-primary);
    }
    .workspace-card {
      cursor: pointer;
      position: relative;
    }
    .workspace-card:hover {
      border-color: var(--brand-blue-light);
    }
    .active-card {
      border-color: var(--brand-blue);
      box-shadow: var(--shadow-md);
      background: #eff6ff;
    }
    .workspace-card-icon {
      width: 42px; height: 42px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-purple) 100%);
      color: white;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem;
      float: left;
      margin-right: 14px;
    }
    .workspace-card-info {
      overflow: hidden;
      margin-bottom: 12px;
    }
    .workspace-card-info h3 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .workspace-card-info p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 34px;
    }
    .workspace-card-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      border-top: 1px solid var(--border-light);
      padding-top: 10px;
      margin-top: 6px;
    }
    .btn-icon-only {
      padding: 6px 8px;
    }
    .workspace-header-details {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .workspace-header-details h2 {
      font-size: 1.15rem;
      margin: 0;
    }
    .workspace-edit-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .members-section h3 {
      font-size: 1rem;
      color: var(--text-primary);
    }
    .empty-state-small {
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 12px 0;
    }
    .member-list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .member-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      gap: 10px;
    }
    .member-info {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .avatar-member {
      background: var(--text-muted);
      color: white;
    }
    .member-email {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .member-role-badge {
      font-size: 0.65rem;
      padding: 1px 6px;
      margin-top: 2px;
    }
    .member-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .inline-select {
      width: auto;
      padding: 4px 8px;
      font-size: 0.8rem;
      height: 30px;
      border-radius: var(--radius-sm);
    }
    .invite-member-card {
      background: var(--bg-primary);
      border: 1px dashed var(--border-color);
    }
    .invite-member-card h4 {
      font-size: 0.9rem;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .invite-member-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `]
})
export class WorkspacesComponent {
  workspaces = signal<Workspace[]>([]);
  selectedWorkspace = signal<Workspace | null>(null);
  members = signal<WorkspaceMember[]>([]);
  newName = '';
  newDescription = '';
  editName = '';
  editDescription = '';
  newInviteEmail = '';
  newInviteRole = 'Member';
  message = signal('');
  isLoading = signal(false);
  showCreateModal = signal(false);

  constructor(public auth: AuthService, private workspaceService: WorkspaceService) {
    if (this.auth.isAuthenticated()) {
      this.loadWorkspaces();
    }
  }

  async loadWorkspaces() {
    this.message.set('');
    this.isLoading.set(true);

    try {
      const list = await this.workspaceService.getWorkspaces();
      this.workspaces.set(list);
      if (this.selectedWorkspace() && list.every(w => w.id !== this.selectedWorkspace()?.id)) {
        this.selectedWorkspace.set(null);
        this.members.set([]);
      }
    } catch (error) {
      this.message.set((error as Error).message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createWorkspace() {
    this.message.set('');
    if (!this.newName.trim()) {
      this.message.set('Workspace name is required.');
      return;
    }

    try {
      const ownerId = '00000000-0000-0000-0000-000000000000';
      const workspace = await this.workspaceService.createWorkspace({
        name: this.newName.trim(),
        description: this.newDescription.trim() || undefined,
        ownerId
      });

      this.workspaces.update((list) => [...list, workspace]);
      this.newName = '';
      this.newDescription = '';
      this.showCreateModal.set(false);
      this.message.set('Workspace created successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  selectWorkspace(workspace: Workspace) {
    this.selectedWorkspace.set(workspace);
    this.editName = workspace.name;
    this.editDescription = workspace.description ?? '';
    this.loadMembers();
  }

  async updateWorkspace() {
    const workspace = this.selectedWorkspace();
    if (!workspace) {
      return;
    }

    this.message.set('');
    try {
      const updated = await this.workspaceService.updateWorkspace(workspace.id, {
        name: this.editName.trim(),
        description: this.editDescription.trim() || undefined
      });
      this.selectedWorkspace.set(updated);
      this.workspaces.update((list) => list.map((item) => item.id === updated.id ? updated : item));
      this.message.set('Workspace updated successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async deleteWorkspace(workspaceId: string) {
    if (!confirm('Delete this workspace?')) {
      return;
    }

    this.message.set('');
    try {
      await this.workspaceService.deleteWorkspace(workspaceId);
      this.workspaces.update((list) => list.filter((item) => item.id !== workspaceId));
      if (this.selectedWorkspace()?.id === workspaceId) {
        this.selectedWorkspace.set(null);
        this.members.set([]);
      }
      this.message.set('Workspace deleted successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async loadMembers() {
    const workspace = this.selectedWorkspace();
    if (!workspace) {
      return;
    }

    this.message.set('');
    try {
      const list = await this.workspaceService.getWorkspaceMembers(workspace.id);
      this.members.set(list);
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async inviteMember() {
    const workspace = this.selectedWorkspace();
    if (!workspace) {
      return;
    }

    if (!this.newInviteEmail.trim()) {
      this.message.set('Member email is required.');
      return;
    }

    this.message.set('');
    try {
      const invited = await this.workspaceService.inviteMember({
        workspaceId: workspace.id,
        email: this.newInviteEmail.trim().toLowerCase(),
        role: this.newInviteRole
      });
      this.members.update((list) => [...list, invited]);
      this.newInviteEmail = '';
      this.newInviteRole = 'Member';
      this.message.set('Member invited successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async updateMemberRole(member: WorkspaceMember) {
    if (!member.id || !member.role) {
      return;
    }

    this.message.set('');
    try {
      await this.workspaceService.updateMemberRole(member.id, { role: member.role });
      this.message.set('Member role updated successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }

  async removeMember(memberId: string) {
    if (!confirm('Remove this member from the workspace?')) {
      return;
    }

    this.message.set('');
    try {
      await this.workspaceService.removeMember(memberId);
      this.members.update((list) => list.filter((member) => member.id !== memberId));
      this.message.set('Member removed successfully.');
    } catch (error) {
      this.message.set((error as Error).message);
    }
  }
}

