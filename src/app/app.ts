import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ManifestComponent } from './components/manifest/manifest.component';
import { FocusOverlayComponent } from './components/focus-overlay/focus-overlay.component';
import { StashComponent } from './components/stash/stash.component';
import { InfoComponent } from './components/info/info.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ManifestComponent, FocusOverlayComponent, StashComponent, InfoComponent],
  template: `
    <main class="app-container">
      <app-manifest></app-manifest>
      <app-focus-overlay></app-focus-overlay>
      <app-stash></app-stash>
      <app-info></app-info>
    </main>
    <router-outlet />
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg);
    }
  `]
})
export class App {
  title = 'exec';
}
