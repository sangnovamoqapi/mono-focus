import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamService } from '../../services/stream.service';

@Component({
  selector: 'app-stash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stash-container" *ngIf="streamService.stash().length > 0">
      <div class="stash-header">Stash</div>
      <div class="stash-list">
        @for (item of streamService.stash(); track $index) {
          <div class="stash-item" (click)="unstash($index)">{{ item }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stash-container {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      width: 300px;
      background: var(--color-bg-active);
      border: 1px solid #333;
      border-radius: 6px;
      padding: 0.5rem;
      font-size: 0.9rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .stash-container:hover {
      opacity: 1;
    }

    .stash-header {
      font-weight: bold;
      color: var(--color-keyword);
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    .stash-item {
      padding: 0.25rem 0;
      color: var(--color-string);
      border-bottom: 1px solid #333;
      cursor: pointer;
    }

    .stash-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }


    .stash-item:last-child {
      border-bottom: none;
    }
  `]
})
export class StashComponent {
  streamService = inject(StreamService);

  unstash(index: number) {
    this.streamService.popFromStash(index);
  }
}
