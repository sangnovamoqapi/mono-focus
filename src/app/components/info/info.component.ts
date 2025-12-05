import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-container">
      <button class="info-btn">?</button>
      <div class="info-popover glass-panel">
        <h3>Shortcuts</h3>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="key">Cmd/Ctrl + Enter</span>
            <span class="desc">Focus / Complete</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Cmd/Ctrl + Shift + Enter</span>
            <span class="desc">Uncomplete</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Cmd/Ctrl + I</span>
            <span class="desc">Stash Idea</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Alt + T</span>
            <span class="desc">Toggle Timer (Focus)</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Alt + V</span>
            <span class="desc">Toggle Time View</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Tab / Shift+Tab</span>
            <span class="desc">Indent / Outdent</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 200;
    }

    .info-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.2s;
    }

    .info-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-text);
    }

    .info-popover {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      width: 280px;
      padding: 1rem;
      background: var(--color-bg-active);
      border: 1px solid #333;
      border-radius: 8px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .info-container:hover .info-popover {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    h3 {
      font-size: 0.9rem;
      text-transform: uppercase;
      color: var(--color-keyword);
      margin-bottom: 0.8rem;
      border-bottom: 1px solid #333;
      padding-bottom: 0.4rem;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .key {
      color: var(--color-function);
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .desc {
      color: var(--color-text-muted);
    }
  `]
})
export class InfoComponent {}
