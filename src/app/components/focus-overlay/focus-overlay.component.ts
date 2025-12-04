import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamService } from '../../services/stream.service';

@Component({
  selector: 'app-focus-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="focus-overlay" *ngIf="streamService.isFocusMode()">
      <div class="focus-container">
        <div class="breadcrumbs" *ngIf="streamService.activeLineParents().length > 0">
          @for (parent of streamService.activeLineParents(); track parent.id; let last = $last) {
            <span class="breadcrumb-item">{{ parent.content }}</span>
            <span class="breadcrumb-separator"> &gt; </span>
          }
        </div>
        <div class="focus-line">
          {{ streamService.activeLine().content }}
        </div>
        
        <div class="focus-controls">
          <span class="hint">Cmd+Enter to Complete</span>
          <span class="hint">Esc to Exit</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .focus-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none; /* Let clicks pass through if needed, but mostly capturing keys */
    }

    .focus-container {
      text-align: center;
      animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .focus-line {
      font-size: 3.5rem; /* Significantly bigger */
      font-weight: bold;
      color: var(--color-text);
      margin-bottom: 2rem;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
      line-height: 1.2;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--color-comment);
      font-size: 1.2rem;
      opacity: 0.8;
    }

    .breadcrumb-item {
      color: var(--color-keyword);
    }

    .breadcrumb-separator {
      color: var(--color-text);
      opacity: 0.5;
    }

    .focus-controls {
      opacity: 0.5;
      font-size: 0.9rem;
      display: flex;
      gap: 2rem;
      justify-content: center;
    }

    .hint {
      color: var(--color-comment);
    }

    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class FocusOverlayComponent {
  streamService = inject(StreamService);

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (!this.streamService.isFocusMode()) return;

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (event.shiftKey) {
        this.streamService.uncompleteActiveLine();
      } else {
        this.streamService.completeActiveLine();
      }
    } else if (event.key === 'Escape') {
      this.streamService.toggleFocusMode();
    }
  }
}
