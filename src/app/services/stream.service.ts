import { Injectable, signal, computed } from '@angular/core';
import { StreamLine } from '../models/stream.model';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  // The "Document"
  private linesSignal = signal<StreamLine[]>([
    { id: crypto.randomUUID(), content: 'Project Alpha', indentLevel: 0, completed: false, isHeader: true, isFocus: false },
    { id: crypto.randomUUID(), content: 'setup repo', indentLevel: 1, completed: false, isHeader: false, isFocus: false },
    { id: crypto.randomUUID(), content: 'install dependencies', indentLevel: 1, completed: false, isHeader: false, isFocus: false },
  ]);

  // UI State
  private activeLineIndexSignal = signal<number>(0);
  private focusModeSignal = signal<boolean>(false);
  private stashSignal = signal<string[]>([]);

  // Computed
  readonly lines = this.linesSignal.asReadonly();
  readonly activeLineIndex = this.activeLineIndexSignal.asReadonly();
  readonly isFocusMode = this.focusModeSignal.asReadonly();
  readonly stash = this.stashSignal.asReadonly();

  readonly activeLine = computed(() => 
    this.linesSignal()[this.activeLineIndexSignal()]
  );

  readonly activeLineParents = computed(() => {
    const lines = this.linesSignal();
    const activeIdx = this.activeLineIndexSignal();
    const activeLine = lines[activeIdx];
    if (!activeLine) return [];

    const parents: StreamLine[] = [];
    let currentIndent = activeLine.indentLevel;

    for (let i = activeIdx - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.indentLevel < currentIndent) {
        parents.unshift(line);
        currentIndent = line.indentLevel;
      }
    }
    return parents;
  });

  // Actions
  updateLine(id: string, content: string) {
    this.linesSignal.update(lines => 
      lines.map(l => {
        if (l.id === id) {
          let newContent = content;
          let isHeader = l.isHeader || newContent.startsWith('>');

          // Immediate check for marker at start
          console.log(newContent, isHeader);
          if (newContent.startsWith('>')) {
             isHeader = true;
             newContent = newContent.substring(1); // Strip first char
          } else if (newContent.startsWith('-')) {
             isHeader = false;
             newContent = newContent.substring(1); // Strip first char
          }
          console.log(newContent, isHeader);
          return { ...l, content: newContent, isHeader };
        }
        return l;
      })
    );
  }

  addLine(afterIndex: number) {
    const currentLine = this.linesSignal()[afterIndex];
    
    // Auto-indent if parent was a header
    let newIndent = currentLine ? currentLine.indentLevel : 0;
    if (currentLine && currentLine.isHeader) {
      newIndent++;
    }

    const newLine: StreamLine = {
      id: crypto.randomUUID(),
      content: '',
      indentLevel: newIndent,
      completed: false,
      isHeader: false,
      isFocus: false
    };

    this.linesSignal.update(lines => {
      const newLines = [...lines];
      newLines.splice(afterIndex + 1, 0, newLine);
      return newLines;
    });
    
    this.setActiveLine(afterIndex + 1);
  }

  deleteLine(index: number) {
    this.linesSignal.update(lines => {
      if (lines.length <= 1) return lines; // Don't delete last line
      return lines.filter((_, i) => i !== index);
    });
    // Adjust active index if needed
    if (this.activeLineIndexSignal() >= index && this.activeLineIndexSignal() > 0) {
      this.setActiveLine(this.activeLineIndexSignal() - 1);
    }
  }

  setActiveLine(index: number) {
    if (index >= 0 && index < this.linesSignal().length) {
      this.activeLineIndexSignal.set(index);
    }
  }

  toggleFocusMode() {
    this.focusModeSignal.update(v => !v);
  }

  completeActiveLine() {
    const idx = this.activeLineIndexSignal();
    this.linesSignal.update(lines => 
      lines.map((l, i) => i === idx ? { ...l, completed: true } : l)
    );
    
    // Exit focus mode
    this.focusModeSignal.set(false);
  }

  uncompleteActiveLine() {
    const idx = this.activeLineIndexSignal();
    this.linesSignal.update(lines => 
      lines.map((l, i) => i === idx ? { ...l, completed: false } : l)
    );
  }

  addToStash(content: string) {
    this.stashSignal.update(s => [...s, content]);
  }

  popFromStash(index: number) {
    const stash = this.stashSignal();
    if (index < 0 || index >= stash.length) return;

    const content = stash[index];
    
    // Remove from stash
    this.stashSignal.update(s => s.filter((_, i) => i !== index));

    // Add to stream after active line
    const activeIdx = this.activeLineIndexSignal();
    const currentLine = this.linesSignal()[activeIdx];
    
    const newLine: StreamLine = {
      id: crypto.randomUUID(),
      content: content,
      indentLevel: currentLine ? currentLine.indentLevel : 0,
      completed: false,
      isHeader: this.checkIsHeader(content),
      isFocus: false
    };

    this.linesSignal.update(lines => {
      const newLines = [...lines];
      newLines.splice(activeIdx + 1, 0, newLine);
      return newLines;
    });
    
    // Focus the new line
    this.setActiveLine(activeIdx + 1);
  }

  indentLine(index: number, increase: boolean) {
    this.linesSignal.update(lines => 
      lines.map((l, i) => {
        if (i === index) {
          const newLevel = Math.max(0, l.indentLevel + (increase ? 1 : -1));
          return { ...l, indentLevel: newLevel };
        }
        return l;
      })
    );
  }

  private checkIsHeader(content: string): boolean {
    return content.trim().startsWith('>') || content.trim().endsWith(':');
  }
}
