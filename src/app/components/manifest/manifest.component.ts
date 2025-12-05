import { Component, ElementRef, ViewChildren, QueryList, inject, effect, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreamService } from '../../services/stream.service';
import { StreamLine } from '../../models/stream.model';

@Component({
  selector: 'app-manifest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="manifest-container" [class.dimmed]="streamService.isFocusMode()">
      <div class="line-numbers">
        @for (line of streamService.lines(); track line.id; let i = $index) {
          <div class="line-number" [class.active]="i === streamService.activeLineIndex()">{{ i + 1 }}</div>
        }
      </div>
      
      <div class="editor-area">
        @for (line of streamService.lines(); track line.id; let i = $index) {
          <div 
            class="line-row" 
            [class.active]="i === streamService.activeLineIndex()"
            [style.padding-left.rem]="1.5 + (line.indentLevel * 1.5)"
          >
            <span class="line-marker" [class.header-marker]="line.isHeader">
              @if (line.content.length > 0 || line.isHeader) {
                {{ line.isHeader ? '>' : '-' }}
              }
            </span>
            <input
              #lineInput
              type="text"
              class="line-input"
              [class.header]="line.isHeader"
              [class.completed]="line.completed"
              [ngModel]="line.content"
              (ngModelChange)="updateContent(line.id, $event)"
              (input)="checkInput($event, line.id)" 
              (keydown)="handleKey($event, i, line.id)"
              (focus)="setActive(i)"
              placeholder=""
            >
            @if (streamService.showTimeSpent() && line.timeSpent) {
              <span class="time-spent">{{ formatTime(line.timeSpent) }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .manifest-container {
      display: flex;
      height: 100vh;
      padding-top: 2rem;
      transition: opacity 0.3s ease;
    }

    .manifest-container.dimmed {
      opacity: 0.05;
      /* pointer-events: none; - Removed to ensure keyboard events bubble correctly */
    }

    .line-numbers {
      width: 50px;
      text-align: right;
      padding-right: 1rem;
      color: #6e7681;
      font-size: 0.9rem;
      user-select: none;
    }

    .line-number {
      height: calc(1.5rem + 4px);
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .line-number.active {
      color: var(--color-text);
    }

    .editor-area {
      flex: 1;
      padding-right: 2rem;
    }

    .line-row {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
      min-height: 1.6rem;
    }

    .line-marker {
      color: var(--color-comment);
      margin-right: 0.5rem;
      font-weight: bold;
      user-select: none;
      width: 10px; /* Fixed width for consistency */
      display: inline-block;
      text-align: center;
    }

    .line-marker.header-marker {
      color: var(--color-keyword);
    }

    .line-input {
      flex: 0 1 600px; /* Limit width so time spent isn't too far */
      background: transparent;
      border: none;
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: 1rem;
      outline: none;
      padding: 2px 0;
      line-height: 1.5;
      min-width: 200px; /* Ensure it's not too small */
    }

    .time-spent {
      color: var(--color-comment);
      font-size: 0.8rem;
      margin-left: 1rem;
      opacity: 0.7;
    }

    .line-input.header {
      color: var(--color-keyword);
      font-weight: bold;
    }

    .line-input.completed {
      text-decoration: line-through;
      color: var(--color-comment);
    }

    .line-row.active .line-input {
      background: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class ManifestComponent implements AfterViewChecked {
  streamService = inject(StreamService);
  
  @ViewChildren('lineInput') lineInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor() {
    effect(() => {
      const index = this.streamService.activeLineIndex();
      setTimeout(() => this.focusLine(index), 0);
    });
  }

  ngAfterViewChecked() {
  }

  focusLine(index: number) {
    const inputs = this.lineInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  setActive(index: number) {
    this.streamService.setActiveLine(index);
  }

  updateContent(id: string, content: string) {
    this.streamService.updateLine(id, content);
  }

  checkInput(event: Event, id: string) {
    // Optional
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  handleKey(event: KeyboardEvent, index: number, id: string) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.streamService.setActiveLine(index - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.streamService.setActiveLine(index + 1);
    } else if (event.altKey && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      this.streamService.toggleShowTimeSpent();
    } else if (event.key === 'Enter') {
      if (event.metaKey || event.ctrlKey) {
        // Focus Mode or Uncomplete
        if (!this.streamService.isFocusMode()) {
          event.preventDefault();
          event.stopPropagation();
          
          if (event.shiftKey) {
            this.streamService.uncompleteActiveLine();
          } else {
            this.streamService.toggleFocusMode();
          }
        }
      } else {
        // New Line
        event.preventDefault();
        this.streamService.addLine(index);
      }
    } else if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      const line = this.streamService.lines()[index];
      
      if (input.selectionStart === 0 && input.selectionEnd === 0 && line.indentLevel > 0) {
        event.preventDefault();
        this.streamService.indentLine(index, false);
      } else if (input.value === '') {
        event.preventDefault();
        this.streamService.deleteLine(index);
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.streamService.indentLine(index, !event.shiftKey);
    } else if (event.key === 'i' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      // Stash logic to be implemented
      const content = prompt("Quick Stash:");
      if (content) this.streamService.addToStash(content);
    }
  }
}
