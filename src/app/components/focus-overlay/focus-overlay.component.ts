import { Component, inject, HostListener, OnInit, OnDestroy, signal, effect } from '@angular/core';
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
        
        <!-- Timer UI -->
        <div class="timer-wrapper" *ngIf="showTimer()">
          <div class="timer-container" [class.wiggle]="timeLeft() === 0">
            <div class="timer-display">
              <input 
                class="time-input" 
                type="number" 
                [value]="minutesDisplay" 
                (input)="onTimeChange('min', $event)"
                [readonly]="isRunning()"
                min="0" max="99"
              >
              <span class="colon">:</span>
              <input 
                class="time-input" 
                type="number" 
                [value]="secondsDisplay" 
                (input)="onTimeChange('sec', $event)"
                [readonly]="isRunning()"
                min="0" max="59"
              >
            </div>
            
            <div class="timer-controls">
              <button class="btn-icon" (click)="isRunning() ? pauseTimer() : startTimer()">
                {{ isRunning() ? '⏸' : '▶' }}
              </button>
              <button class="btn-icon" (click)="resetTimer()">↺</button>
            </div>

            <button class="btn-icon close-timer" (click)="toggleTimerVisibility(false)">×</button>
          </div>
        </div>
        
        <div class="timer-hint" *ngIf="!showTimer()">
          <span class="hint">Alt+T to Timer</span>
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
      background: rgba(0, 0, 0, 0.8); /* Dim background */
      backdrop-filter: blur(5px);
    }

    .focus-container {
      text-align: center;
      animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto; /* Enable interaction for timer button */
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
      margin-top: 2rem;
    }

    .hint {
      color: var(--color-comment);
    }

    /* Timer Styles */
    .timer-wrapper {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      pointer-events: auto;
    }

    .timer-container {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      background: rgba(20, 20, 20, 0.9);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .timer-container.wiggle {
      animation: wiggle 0.5s ease-in-out infinite;
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .timer-display {
      font-family: var(--font-mono);
      font-size: 1.5rem;
      color: var(--color-text);
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .time-input {
      background: transparent;
      border: none;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      font-weight: inherit;
      width: 2ch;
      text-align: center;
      padding: 0;
      outline: none;
      -moz-appearance: textfield;
    }
    
    .time-input::-webkit-outer-spin-button,
    .time-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .time-input:focus {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    .time-input[readonly] {
      pointer-events: none;
    }

    .timer-display:hover {
      color: var(--color-accent);
    }

    .timer-controls {
      display: flex;
      gap: 0.5rem;
      margin-right: 1rem;
      padding-right: 1rem;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-icon {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      opacity: 0.7;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      opacity: 1;
      color: var(--color-text);
      transform: scale(1.1);
    }
    
    .close-timer {
      font-size: 1.5rem;
      margin-left: 0.5rem;
    }

    .timer-hint {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
    }

    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
  `]
})
export class FocusOverlayComponent implements OnInit, OnDestroy {
  streamService = inject(StreamService);
  
  showTimer = signal(true);
  
  // Timer State
  timerDuration = signal(15 * 60); // Default 15 minutes in seconds
  timeLeft = signal(15 * 60);
  isRunning = signal(false);
  
  private timerInterval: any;
  private lastTickTime: number = 0;

  private currentLineId: string | null = null;

  constructor() {
    effect(() => {
      const activeLine = this.streamService.activeLine();
      
      // Only reset if the line ID has actually changed
      if (activeLine && activeLine.id !== this.currentLineId) {
        this.currentLineId = activeLine.id;
        
        // Use untracked to ensure we don't create dependencies on other signals if resetTimer accesses them
        // (though resetTimer mostly sets signals)
        this.resetTimer();
      }
    });
  }

  ngOnInit() {
    // Reset timer state when entering focus mode
    this.resetTimer();
  }

  ngOnDestroy() {
    this.pauseTimer();
  }

  toggleTimerVisibility(show: boolean) {
    this.showTimer.set(show);
  }

  // Timer Controls
  startTimer() {
    console.log('startTimer called. isRunning:', this.isRunning(), 'timeLeft:', this.timeLeft());
    if (!this.isRunning() && this.timeLeft() > 0) {
      this.isRunning.set(true);
      this.lastTickTime = Date.now();
      
      // Use requestAnimationFrame for snappier UI updates if we were animating a progress bar,
      // but for text, 1s interval is standard. However, to feel "snappy", we can check more often
      // to avoid drift, but update UI only on second change.
      // Or simply: the issue might be that "exit" doesn't trigger ngOnDestroy immediately?
      // *ngIf does trigger ngOnDestroy.
      
      this.timerInterval = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - this.lastTickTime) / 1000);
        
        if (delta >= 1) {
          // Update countdown
          const newTimeLeft = Math.max(0, this.timeLeft() - delta);
          this.timeLeft.set(newTimeLeft);
          
          // Accumulate actual time spent on the task
          this.streamService.updateLineTime(this.streamService.activeLine().id, delta);
          
          this.lastTickTime = now; // Reset tick time to now to handle drift

          if (newTimeLeft === 0) {
            this.pauseTimer();
          }
        }
      }, 100); // Check every 100ms for snappier response to start/stop, but update logic handles 1s ticks
    }
  }

  pauseTimer() {
    this.isRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft.set(this.timerDuration());
  }

  setDuration(minutes: number) {
    this.timerDuration.set(minutes * 60);
    this.resetTimer();
  }

  // Timer Editing
  onTimeChange(type: 'min' | 'sec', event: Event) {
    const input = event.target as HTMLInputElement;
    let val = parseInt(input.value, 10);
    
    // Handle empty or invalid input
    if (isNaN(val)) {
      // If user clears the input, treat as 0 temporarily, 
      // but don't update if it's just a partial edit? 
      // Actually, updating to 0 is fine, it gives immediate feedback.
      val = 0; 
    }
    
    let currentSeconds = this.timeLeft();
    let mins = Math.floor(currentSeconds / 60);
    let secs = currentSeconds % 60;

    if (type === 'min') {
      mins = Math.max(0, Math.min(99, val)); // Allow up to 99 mins
    } else {
      secs = Math.max(0, Math.min(59, val)); // Cap at 59 secs
    }

    const newTotal = (mins * 60) + secs;
    this.timerDuration.set(newTotal); // Update default duration
    this.timeLeft.set(newTotal);      // Update current time
    
    // Force input value update if we clamped it (e.g. user typed 99, we set 59)
    // We need to update the input element's value directly because 
    // Angular change detection might not trigger if the model value didn't change 
    // (e.g. if it was already 59 and user typed 99, model stays 59, input shows 99).
    if (input.value !== val.toString() && input.value !== '') {
       // Actually, we want to show the clamped value
       // But we also want to pad it? 
       // The template binding [value]="minutesDisplay" handles padding on change detection.
       // But if we type '99', model becomes 59. View should update to '59'.
       // If the view doesn't update, we might need to force it.
       // Let's rely on the getter binding.
    }
  }

  // Helper for template
  get minutesDisplay(): string {
    return Math.floor(this.timeLeft() / 60).toString().padStart(2, '0');
  }

  get secondsDisplay(): string {
    return (this.timeLeft() % 60).toString().padStart(2, '0');
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (!this.streamService.isFocusMode()) return;

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.pauseTimer(); // Stop timer on action
      if (event.shiftKey) {
        this.streamService.uncompleteActiveLine();
      } else {
        this.streamService.completeActiveLine();
      }
    } else if (event.key === 'Escape') {
      this.pauseTimer(); // Ensure timer stops immediately
      this.streamService.toggleFocusMode();
    } else if (event.altKey && event.key.toLowerCase() === 't') {
      event.preventDefault();
      this.toggleTimerVisibility(!this.showTimer());
    } else if (event.code === 'Space' && (event.target as HTMLElement).tagName !== 'INPUT') {
       // Optional: Space to toggle play/pause if not typing
       event.preventDefault();
       if (this.isRunning()) this.pauseTimer();
       else this.startTimer();
    }
  }
}
