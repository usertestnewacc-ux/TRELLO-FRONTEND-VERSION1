import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';
import { CommentItem, CreateCommentPayload } from './comment.types';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private readonly apiUrl = apiUrl;

  getComments(cardId: string): Promise<CommentItem[]> {
    return firstValueFrom(this.http.get<CommentItem[]>(`${this.apiUrl}/comments/card/${cardId}`));
  }

  createComment(payload: CreateCommentPayload): Promise<CommentItem> {
    return firstValueFrom(this.http.post<CommentItem>(`${this.apiUrl}/comments`, payload));
  }

  deleteComment(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/comments/${id}`));
  }
}
