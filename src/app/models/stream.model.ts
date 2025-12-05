export interface StreamLine {
  id: string;
  content: string;
  indentLevel: number;
  completed: boolean;
  isHeader: boolean; // Derived from content (e.g. ends with ':')
  isFocus: boolean;
  timeSpent?: number; // In seconds
}
