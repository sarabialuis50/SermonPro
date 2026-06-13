import React, { useState } from "react";
import { 
  FileText, BookOpen, Clock, AlertTriangle, CheckCircle, 
  Sparkles, Trash2, ChevronDown, ChevronUp, 
  Plus, Check, Copy, X, ChevronLeft, StickyNote 
} from "lucide-react";
import { Sermon, SermonSection, Note } from "../types";
import { generateSermonContentAsync, BIBLE_REGEX_STR } from "../utils";
import NoteModal from "./NoteModal";
import AiAssistantModal from "./AiAssistantModal";

const ANTIGUO_TESTAMENTO = [
  { abbrev: "Gén", name: "Génesis", chapters: 50 },
  { abbrev: "Éxo", name: "Éxodo", chapters: 40 },
  { abbrev: "Lev", name: "Levítico", chapters: 27 },
  { abbrev: "Núm", name: "Números", chapters: 36 },
  { abbrev: "Deu", name: "Deuteronomio", chapters: 34 },
  { abbrev: "Jos", name: "Josué", chapters: 24 },
  { abbrev: "Jue", name: "Jueces", chapters: 21 },
  { abbrev: "Rut", name: "Rut", chapters: 4 },
  { abbrev: "1 Sam", name: "1 Samuel", chapters: 31 },
  { abbrev: "2 Sam", name: "2 Samuel", chapters: 24 },
  { abbrev: "1 Re", name: "1 Reyes", chapters: 22 },
  { abbrev: "2 Re", name: "2 Reyes", chapters: 25 },
  { abbrev: "1 Cró", name: "1 Crónicas", chapters: 29 },
  { abbrev: "2 Cró", name: "2 Crónicas", chapters: 36 },
  { abbrev: "Esd", name: "Esdras", chapters: 10 },
  { abbrev: "Neh", name: "Nehemías", chapters: 13 },
  { abbrev: "Est", name: "Ester", chapters: 10 },
  { abbrev: "Job", name: "Job", chapters: 42 },
  { abbrev: "Sal", name: "Salmos", chapters: 150 },
  { abbrev: "Pro", name: "Proverbios", chapters: 31 },
  { abbrev: "Ecl", name: "Eclesiastés", chapters: 12 },
  { abbrev: "Cant", name: "Cantares", chapters: 8 },
  { abbrev: "Isa", name: "Isaías", chapters: 66 },
  { abbrev: "Jer", name: "Jeremías", chapters: 52 },
  { abbrev: "Lam", name: "Lamentaciones", chapters: 5 },
  { abbrev: "Eze", name: "Ezequiel", chapters: 48 },
  { abbrev: "Dan", name: "Daniel", chapters: 12 },
  { abbrev: "Os", name: "Oseas", chapters: 14 },
  { abbrev: "Jl", name: "Joel", chapters: 3 },
  { abbrev: "Am", name: "Amós", chapters: 9 },
  { abbrev: "Abd", name: "Abdías", chapters: 1 },
  { abbrev: "Jon", name: "Jonás", chapters: 4 },
  { abbrev: "Miq", name: "Miqueas", chapters: 7 },
  { abbrev: "Nah", name: "Nahúm", chapters: 3 },
  { abbrev: "Hab", name: "Habacuc", chapters: 3 },
  { abbrev: "Sof", name: "Sofonías", chapters: 3 },
  { abbrev: "Hag", name: "Hageo", chapters: 2 },
  { abbrev: "Zac", name: "Zacarías", chapters: 14 },
  { abbrev: "Mal", name: "Malaquías", chapters: 4 }
];

const NUEVO_TESTAMENTO = [
  { abbrev: "Mat", name: "Mateo", chapters: 28 },
  { abbrev: "Mar", name: "Marcos", chapters: 16 },
  { abbrev: "Luc", name: "Lucas", chapters: 24 },
  { abbrev: "Jn", name: "Juan", chapters: 21 },
  { abbrev: "Hch", name: "Hechos", chapters: 28 },
  { abbrev: "Rom", name: "Romanos", chapters: 16 },
  { abbrev: "1 Cor", name: "1 Corintios", chapters: 16 },
  { abbrev: "2 Cor", name: "2 Corintios", chapters: 13 },
  { abbrev: "Gál", name: "Gálatas", chapters: 6 },
  { abbrev: "Efe", name: "Efesios", chapters: 6 },
  { abbrev: "Flp", name: "Filipenses", chapters: 4 },
  { abbrev: "Col", name: "Colosenses", chapters: 4 },
  { abbrev: "1 Tes", name: "1 Tesalonicenses", chapters: 5 },
  { abbrev: "2 Tes", name: "2 Tesalonicenses", chapters: 3 },
  { abbrev: "1 Tim", name: "1 Timoteo", chapters: 6 },
  { abbrev: "2 Tim", name: "2 Timoteo", chapters: 4 },
  { abbrev: "Tit", name: "Tito", chapters: 3 },
  { abbrev: "Flm", name: "Filemón", chapters: 1 },
  { abbrev: "Heb", name: "Hebreos", chapters: 13 },
  { abbrev: "Sant", name: "Santiago", chapters: 5 },
  { abbrev: "1 Pe", name: "1 Pedro", chapters: 5 },
  { abbrev: "2 Pe", name: "2 Pedro", chapters: 3 },
  { abbrev: "1 Jn", name: "1 Juan", chapters: 5 },
  { abbrev: "2 Jn", name: "2 Juan", chapters: 1 },
  { abbrev: "3 Jn", name: "3 Juan", chapters: 1 },
  { abbrev: "Jud", name: "Judas", chapters: 1 },
  { abbrev: "Apoc", name: "Apocalipsis", chapters: 22 }
];

const BookOpenIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-0.5 shrink-0"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

const StickyNoteIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-0.5 shrink-0"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L16 3Z"/><path d="M16 3v6h6"/></svg>`;

const textToHtml = (text: string): string => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\[Nota:\s*(.*?)\]/gi, (match, noteText) => {
    return `<span class="editor-note-badge inline-flex items-center space-x-1 py-0.5 px-2 bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-sans font-bold border border-sky-500/35 mx-1 align-baseline cursor-pointer rounded-sm text-xs md:text-sm hover:bg-sky-500/20 select-none" contenteditable="false" data-note="${noteText.replace(/"/g, '&quot;')}">${StickyNoteIconSvg}<span>Nota</span></span>`;
  });

  const bibleRegex = new RegExp(BIBLE_REGEX_STR, 'gi');
  html = html.replace(bibleRegex, (match) => {
    return `<span class="editor-bible-badge inline-flex items-center space-x-1 py-0.5 px-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-serif font-bold italic border border-amber-500/35 mx-1 align-baseline select-text rounded-sm text-xs md:text-sm select-none" contenteditable="false" data-bible="${match}">${BookOpenIconSvg}<span>${match}</span></span>`;
  });

  return html;
};

const htmlToText = (node: Node): string => {
  let text = "";
  for (let child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (el.classList.contains('editor-note-badge')) {
        text += `[Nota: ${el.getAttribute('data-note')}]`;
      } else if (el.classList.contains('editor-bible-badge')) {
        text += el.getAttribute('data-bible');
      } else if (el.tagName === 'BR') {
        text += "\n";
      } else if (el.tagName === 'DIV' || el.tagName === 'P') {
        const childText = htmlToText(el);
        text += (text.length > 0 && !text.endsWith('\n') ? '\n' : '') + childText;
      } else {
        text += htmlToText(el);
      }
    }
  }
  return text;
};

function RichTextEditor({ value, onChange, placeholder, className, onOpenNote }: any) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (!value) {
        editorRef.current.innerHTML = `<span class="text-slate-400 dark:text-zinc-655 italic pointer-events-none select-none">${placeholder}</span>`;
      } else {
        editorRef.current.innerHTML = textToHtml(value);
      }
    }
  }, [value, placeholder]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const newText = htmlToText(editorRef.current);
    if (newText !== value) {
      onChange(newText);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const noteBadge = target.closest('.editor-note-badge');
    if (noteBadge) {
      e.stopPropagation();
      const note = noteBadge.getAttribute('data-note');
      if (note && onOpenNote) {
        onOpenNote(note);
      }
    }
  };

  const handleFocus = () => {
    if (editorRef.current && !value) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleBlur = () => {
    if (!editorRef.current) return;
    const newText = htmlToText(editorRef.current);
    if (!newText) {
      editorRef.current.innerHTML = `<span class="text-slate-400 dark:text-zinc-655 italic pointer-events-none select-none">${placeholder}</span>`;
    }
    handleInput();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      style={{ userSelect: 'text', whiteSpace: 'pre-wrap' }}
    />
  );
}

interface SermonEditorProps {
  sermon: Sermon;
  onChange: (updatedSermon: Sermon) => void;
  onStartPreaching: () => void;
  isProUser?: boolean;
}

export default function SermonEditor({ sermon, onChange, onStartPreaching, isProUser = true }: SermonEditorProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Bible Builder state
  const [activeBibleBuilderSectionId, setActiveBibleBuilderSectionId] = useState<string | null>(null);
  const [bibleBuilderStep, setBibleBuilderStep] = useState<"book" | "chapter" | "verse">("book");
  const [selectedBook, setSelectedBook] = useState<{ abbrev: string; name: string; chapters: number } | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Note Builder state
  const [activeNoteBuilderSectionId, setActiveNoteBuilderSectionId] = useState<string | null>(null);
  const [noteBuilderText, setNoteBuilderText] = useState("");
  const [activeNoteViewerContent, setActiveNoteViewerContent] = useState<string | null>(null);

  // AI Assistant state
  const [aiAssistantSectionId, setAiAssistantSectionId] = useState<string | null>(null);

  const handleOpenBibleBuilder = (sectionId: string) => {
    setActiveBibleBuilderSectionId(sectionId);
    setBibleBuilderStep("book");
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerses([]);
  };

  const handleOpenNoteBuilder = (sectionId: string) => {
    setActiveNoteBuilderSectionId(sectionId);
    setNoteBuilderText("");
  };

  const handleConfirmNote = () => {
    if (!activeNoteBuilderSectionId || !noteBuilderText.trim()) return;

    const formattedNote = `[Nota: ${noteBuilderText.trim()}]`;

    const updatedSections = sermon.sections.map(sec => {
      if (sec.id === activeNoteBuilderSectionId) {
        const spacer = sec.content ? (sec.content.endsWith(" ") ? "" : " ") : "";
        return {
          ...sec,
          content: sec.content + spacer + formattedNote
        };
      }
      return sec;
    });

    onChange({
      ...sermon,
      sections: updatedSections
    });

    setActiveNoteBuilderSectionId(null);
    setNoteBuilderText("");
  };

  const handleOpenNoteViewer = (noteText: string) => {
    setActiveNoteViewerContent(noteText);
  };

  const handleSelectBook = (book: typeof ANTIGUO_TESTAMENTO[0]) => {
    setSelectedBook(book);
    setBibleBuilderStep("chapter");
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setBibleBuilderStep("verse");
  };

  const handleToggleVerse = (verse: number) => {
    if (selectedVerses.includes(verse)) {
      setSelectedVerses(selectedVerses.filter(v => v !== verse));
    } else {
      setSelectedVerses([...selectedVerses, verse]);
    }
  };

  const formatVerses = (selected: number[]): string => {
    if (selected.length === 0) return "";
    const sorted = [...selected].sort((a, b) => a - b);
    
    let isContiguous = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        isContiguous = false;
        break;
      }
    }
    
    if (isContiguous && sorted.length > 1) {
      return `${sorted[0]}-${sorted[sorted.length - 1]}`;
    } else {
      return sorted.join(",");
    }
  };

  const handleConfirmBibleVerse = () => {
    if (!activeBibleBuilderSectionId || !selectedBook || !selectedChapter) return;

    const versePart = formatVerses(selectedVerses);
    const citation = `${selectedBook.name} ${selectedChapter}${versePart ? ":" + versePart : ""}`;

    const updatedSections = sermon.sections.map(sec => {
      if (sec.id === activeBibleBuilderSectionId) {
        const spacer = sec.content ? (sec.content.endsWith(" ") ? "" : " ") : "";
        return {
          ...sec,
          content: sec.content + spacer + citation
        };
      }
      return sec;
    });

    onChange({
      ...sermon,
      sections: updatedSections
    });

    // Reset state and close
    setActiveBibleBuilderSectionId(null);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerses([]);
    setBibleBuilderStep("book");
  };

  const handleSermonFieldChange = (field: keyof Sermon, value: any) => {
    onChange({
      ...sermon,
      [field]: value
    });
  };

  const handleSectionChange = (sectionId: string, updates: Partial<SermonSection>) => {
    const updatedSections = sermon.sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, ...updates };
      }
      return section;
    });
    onChange({
      ...sermon,
      sections: updatedSections
    });
  };

  // Replaced parseEditorReferences with RichTextEditor

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sermon.sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newSections = [...sermon.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    onChange({
      ...sermon,
      sections: newSections
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sermon.sections.filter((s) => s.id !== sectionId);
    onChange({
      ...sermon,
      sections: updatedSections
    });
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    const newSection: SermonSection = {
      id: "sec_" + Date.now(),
      title: newSectionTitle.trim(),
      durationMinutes: 10,
      content: ""
    };

    const updatedSections = [...sermon.sections, newSection];
    onChange({
      ...sermon,
      sections: updatedSections
    });

    // Auto-expand newly added section
    setExpandedSectionIds((prev) => ({
      ...prev,
      [newSection.id]: true
    }));

    setNewSectionTitle("");
  };

  // Toggle single item accordion state
  const handleToggleExpand = (sectionId: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleExpandAll = () => {
    const expanded: Record<string, boolean> = {};
    sermon.sections.forEach((s) => {
      expanded[s.id] = true;
    });
    setExpandedSectionIds(expanded);
  };

  const handleCollapseAll = () => {
    setExpandedSectionIds({});
  };

  // Time redistribution calculators
  const distributeSermonTime = (type: "equal" | "homilectic") => {
    if (sermon.sections.length === 0) return;
    const totalBudget = typeof sermon.durationMinutes === "number" 
      ? sermon.durationMinutes 
      : parseInt(sermon.durationMinutes, 10) || 0;
    const N = sermon.sections.length;

    console.log("distributeSermonTime triggered:", { type, totalBudget, N });

    if (type === "equal") {
      const minutesPerSection = Math.floor(totalBudget / N);
      const remainder = totalBudget % N;

      const updatedSections = sermon.sections.map((sec, index) => {
        // distribute remainder minutes to initial blocks
        const extra = index < remainder ? 1 : 0;
        return {
          ...sec,
          durationMinutes: minutesPerSection + extra
        };
      });

      console.log("equal distribution result:", updatedSections);
      onChange({ ...sermon, sections: updatedSections });
    } else if (type === "homilectic") {
      if (N === 1) {
        onChange({
          ...sermon,
          sections: [{ ...sermon.sections[0], durationMinutes: totalBudget }]
        });
        return;
      }

      if (N === 2) {
        const introTarget = Math.max(1, Math.round(totalBudget * 0.20));
        const conclTarget = Math.max(1, totalBudget - introTarget);
        const updatedSections = [
          { ...sermon.sections[0], durationMinutes: introTarget },
          { ...sermon.sections[1], durationMinutes: conclTarget }
        ];
        console.log("homilectic N=2 distribution result:", updatedSections);
        onChange({ ...sermon, sections: updatedSections });
        return;
      }

      const introTarget = Math.max(1, Math.round(totalBudget * 0.15));
      const conclTarget = Math.max(1, Math.round(totalBudget * 0.15));
      const bodyBudget = Math.max(0, totalBudget - (introTarget + conclTarget));

      const updatedSections = sermon.sections.map((sec, index) => {
        if (index === 0) {
          return { ...sec, durationMinutes: introTarget };
        } else if (index === N - 1) {
          return { ...sec, durationMinutes: conclTarget };
        } else {
          const bodySectionsCount = N - 2;
          const portion = Math.floor(bodyBudget / bodySectionsCount);
          const rem = bodyBudget % bodySectionsCount;
          const extra = (index - 1) < rem ? 1 : 0;
          return { ...sec, durationMinutes: portion + extra };
        }
      });

      console.log("homilectic N>=3 distribution result:", updatedSections);
      onChange({ ...sermon, sections: updatedSections });
    }
  };

  const copySermonClipboard = () => {
    const fullText = `TITULO: ${sermon.title}
TEMA CENTRAL: ${sermon.theme}
PASAJE BASE: ${sermon.mainPassage}
DURACIÓN: ${sermon.durationMinutes} minutos

=== BOSQUEJO DE SECCIONES ===
${sermon.sections.map((s, idx) => `${idx + 1}. [${s.durationMinutes} min] ${s.title}\n------------------------\n${s.content || "(Sin apuntes)"}`).join("\n\n")}

=== NOTAS ADICIONALES ===
${sermon.notes || "No hay notas adicionales."}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sectionsTotalMinutes = sermon.sections.reduce((acc, sec) => acc + (sec.durationMinutes || 0), 0);
  const isTimeBalanced = sectionsTotalMinutes === sermon.durationMinutes;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sermon-editor-workspace">
      
      {/* Editorial Settings Panel */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Core Metadata Form */}
        <div className="border-2 border-slate-900 bg-white p-6 shadow-geometric dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          <div className="flex items-center space-x-2.5 mb-5 border-b-2 border-slate-900 pb-3 dark:border-zinc-800">
            <div className="p-1.5 bg-slate-105 text-slate-900 dark:bg-zinc-805 dark:text-amber-400 border border-slate-900/30">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 dark:text-stone-100 font-sans">
              Datos Generales del Mensaje
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-405 mb-1">
                Título del Sermón
              </label>
              <input
                type="text"
                value={sermon.title}
                onChange={(e) => handleSermonFieldChange("title", e.target.value)}
                placeholder="Ej. La Roca Firme en la Tormenta"
                className="w-full rounded-none border-2 border-slate-900 px-4 py-2.5 text-sm outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                id="sermon-title-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-405 mb-1">
                Tema / Concepto Central
              </label>
              <input
                type="text"
                value={sermon.theme}
                onChange={(e) => handleSermonFieldChange("theme", e.target.value)}
                placeholder="Ej. Fe y Obediencia en tiempos de prueba"
                className="w-full rounded-none border-2 border-slate-900 px-4 py-2.5 text-sm outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                id="sermon-theme-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-405 mb-1">
                  Pasaje Bíblico Base
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={sermon.mainPassage}
                    onChange={(e) => handleSermonFieldChange("mainPassage", e.target.value)}
                    placeholder="Ej. Mateo 7:24-27"
                    className="w-full rounded-none border-2 border-slate-900 pl-9 pr-3 py-2.5 text-sm outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    id="sermon-passage-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-405 mb-1">
                  Duración Total (min)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
                    <Clock className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={sermon.durationMinutes || ""}
                    onChange={(e) => handleSermonFieldChange("durationMinutes", parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-none border-2 border-slate-900 pl-9 pr-3 py-2.5 text-sm outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    id="sermon-duration-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Versión Bíblica de Consulta
              </label>
              <select
                value={sermon.bibleVersion || "RVR1960"}
                onChange={(e) => handleSermonFieldChange("bibleVersion", e.target.value)}
                className="w-full rounded-none border-2 border-slate-900 px-3 py-2.5 text-sm bg-white focus:outline-hidden dark:bg-zinc-950 dark:text-white dark:border-zinc-850"
                id="sermon-bible-version-select"
              >
                {BIBLE_VERSIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.id})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Time Balance Widget */}
        <div className="border-2 border-slate-900 bg-white p-6 shadow-geometric dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200">
              Balances de Tiempo Homiléticos
            </h3>
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 font-mono">En Vivo</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center py-2 mb-4">
            <div className="bg-slate-50 dark:bg-zinc-950/45 p-3 border-2 border-slate-900">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5 font-mono">Planificado</span>
              <span className="text-xl font-serif font-bold text-slate-950 dark:text-stone-100 block">
                {sermon.durationMinutes} min
              </span>
            </div>
            <div className={`p-3 border-2 transition-all ${
              isTimeBalanced 
                ? "bg-emerald-50 border-slate-900 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300"
                : "bg-red-55 border-slate-900 text-red-950 dark:bg-red-950/20 dark:text-red-350"
            }`}>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5 font-mono">Suma Secciones</span>
              <span className="text-xl font-serif font-bold block">
                {sectionsTotalMinutes} min
              </span>
            </div>
          </div>

          {/* Warnings and validation remarks */}
          {isTimeBalanced ? (
            <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-50 text-emerald-95 border-2 border-slate-900 text-xs dark:bg-emerald-950/30 dark:text-emerald-300 mb-5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px]">Estructura Balanceada</p>
                <p className="text-slate-650 dark:text-zinc-400 mt-0.5 text-[11px] leading-tight">El tiempo asignado es exactamente igual a la suma de los bloques. ¡Estás listo para el púlpito!</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2.5 p-3.5 bg-amber-50 text-slate-950 border-2 border-slate-900 text-xs dark:bg-amber-950/30 dark:text-amber-300 mb-5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800">Desfase Detectado ({sectionsTotalMinutes - sermon.durationMinutes} min)</p>
                <p className="text-slate-800 dark:text-zinc-400 mt-0.5 text-[11px] leading-snug">
                  La suma total es de <strong>{sectionsTotalMinutes} min</strong> pero definiste <strong>{sermon.durationMinutes} min</strong>. Ajusta manualmente o presiona los botones de balance inteligente de abajo.
                </p>
              </div>
            </div>
          )}

          {/* Quick redistribution presets actions */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block mb-1 font-mono">
              Repartición de Minutos Automática
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => distributeSermonTime("equal")}
                disabled={sermon.sections.length === 0}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-bold border-2 border-slate-900 tracking-wider uppercase cursor-pointer shadow-geometric"
                title="Repartir minutos equitativamente"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Equitativo</span>
              </button>
              <button
                type="button"
                onClick={() => distributeSermonTime("homilectic")}
                disabled={sermon.sections.length === 0}
                className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-amber-950/30 dark:hover:bg-amber-900/40 dark:text-amber-300 text-xs font-bold border-2 border-slate-900 tracking-wider uppercase cursor-pointer shadow-geometric"
                title="15% Introducción, 70% Temario, 15% Conclusión"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Homilético</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notes additions */}
        <div className="border-2 border-slate-900 bg-white p-6 shadow-geometric dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 font-mono">
            Instrucciones y Notas del Predicador (Privado)
          </label>
          <textarea
            value={sermon.notes || ""}
            onChange={(e) => handleSermonFieldChange("notes", e.target.value)}
            placeholder="Recordatorios privados, cuándo pedir música de piano de fondo, transiciones específicas de oraciones..."
            className="w-full h-24 rounded-none border-2 border-slate-900 p-3 text-xs outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-sans scrollbar-thin resize-none"
            id="sermon-notes-input"
          />
        </div>

        {/* Master Active Live Action card */}
        <div className="pt-2">
          <button
            onClick={onStartPreaching}
            disabled={sermon.sections.length === 0}
            className={`w-full py-4 text-slate-950 font-serif font-bold text-base border-2 border-slate-900 uppercase tracking-widest transition-all cursor-pointer ${
              sermon.sections.length === 0
                ? "bg-stone-300 border-slate-400 cursor-not-allowed text-stone-500 shadow-none dark:bg-zinc-900"
                : "bg-amber-500 hover:bg-amber-400 shadow-geometric-lg hover:translate-x-0.5 hover:translate-y-0.5"
            }`}
            id="start-preaching-master-btn"
          >
            <Clock className="h-5 w-5 inline mr-2 text-slate-950 animate-pulse" />
            <span>INICIAR MODO EN VIVO (PÚLPITO)</span>
          </button>
          
          <div className="mt-4 flex items-center justify-between px-2 text-[10px] font-mono font-bold uppercase tracking-tight text-slate-400">
            <button
              onClick={copySermonClipboard}
              className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer"
              title="Copiar sermón completo"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Borrador Sermón</span>
                </>
              )}
            </button>
            <span>Auto-guardado en Local</span>
          </div>
        </div>

      </div>

      {/* Structured Sections list */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Sections Header Control */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-zinc-950/30 p-4 border-2 border-slate-900">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-stone-200 font-sans">
              Bosquejo y Secciones del Sermón
            </span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-white dark:bg-zinc-800 dark:text-neutral-350">
              {sermon.sections.length}
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handleExpandAll}
              disabled={sermon.sections.length === 0}
              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:text-zinc-200 hover:text-slate-950 border-2 border-slate-900 bg-white dark:bg-zinc-900 cursor-pointer shadow-geometric"
            >
              Expandir Todo
            </button>
            <button
              onClick={handleCollapseAll}
              disabled={sermon.sections.length === 0}
              className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:text-zinc-200 hover:text-slate-950 border-2 border-slate-900 bg-white dark:bg-zinc-900 cursor-pointer shadow-geometric"
            >
              Colapsar Todo
            </button>
          </div>
        </div>

        {/* Section List cards */}
        <div className="space-y-4">
          {sermon.sections.length === 0 ? (
            <div className="py-12 text-center bg-white border-2 border-dashed border-slate-900 dark:bg-zinc-900 dark:border-zinc-700">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-zinc-400">No hay secciones registradas aún</p>
              <p className="text-xs text-slate-500 mt-1">Escribe abajo para añadir la primera sección del mensaje</p>
            </div>
          ) : (
            sermon.sections.map((section, index) => {
              const isFirst = index === 0;
              const isLast = index === sermon.sections.length - 1;
              const isExpanded = !!expandedSectionIds[section.id];

              return (
                <div 
                  key={section.id}
                  className="border-2 border-slate-900 bg-white shadow-geometric dark:border-zinc-800 dark:bg-zinc-900/90 overflow-hidden transition-all duration-350"
                  id={`editor-section-card-${index}`}
                >
                  {/* Collapsed/Expanded Header trigger */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-950/15 border-b-2 border-slate-900 pb-3">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {/* Left Drag handles (mock up/down) */}
                      <div className="flex flex-col space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, "up")}
                          disabled={isFirst}
                          className={`p-0.5 rounded-none hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            isFirst ? "text-slate-300 dark:text-zinc-800 cursor-not-allowed" : "text-slate-900 dark:text-zinc-400"
                          }`}
                          title="Subir posición"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, "down")}
                          disabled={isLast}
                          className={`p-0.5 rounded-none hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            isLast ? "text-slate-300 dark:text-zinc-800 cursor-not-allowed" : "text-slate-900 dark:text-zinc-400"
                          }`}
                          title="Bajar posición"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Number tag */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-900 text-white font-mono text-xs font-bold">
                        {index + 1}
                      </span>

                      {/* Editable name inline */}
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionChange(section.id, { title: e.target.value })}
                        placeholder={`Ej. Introducción o Punto ${index + 1}`}
                        className="font-serif text-sm font-bold text-slate-950 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-dashed hover:border-slate-300 focus:border-amber-500 focus:outline-hidden py-0.5 w-full mr-2"
                        title="Haga clic para renombrar sección"
                      />
                    </div>

                    {/* Right controls: timer, collapse, delete */}
                    <div className="flex items-center space-x-2 shrink-0">
                      
                      {/* AI Assistant Button */}
                      <div className="flex flex-col items-center justify-end h-full">
                        <span className="text-[7.5px] font-bold uppercase tracking-tight text-slate-500 leading-none mb-1">IA</span>
                        <button
                          type="button"
                          onClick={() => setAiAssistantSectionId(section.id)}
                          className="p-1 rounded-sm border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-amber-400 transition-colors cursor-pointer flex items-center justify-center h-[26px] w-[26px] shadow-geometric group"
                          title="Asistente de IA (Pro)"
                        >
                          <Sparkles className="h-4 w-4 group-hover:text-amber-500 transition-colors" />
                        </button>
                      </div>

                      {/* Add Bible Verse Button */}
                      <div className="flex flex-col items-center justify-end h-full">
                        <span className="text-[7.5px] font-bold uppercase tracking-tight text-slate-500 leading-none mb-1">Citas</span>
                        <button
                          type="button"
                          onClick={() => handleOpenBibleBuilder(section.id)}
                          className="p-1 rounded-sm border-2 border-slate-900 bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer flex items-center justify-center h-[26px] w-[26px] shadow-geometric"
                          title="Insertar cita bíblica asistida"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Add Note Button */}
                      <div className="flex flex-col items-center justify-end h-full">
                        <span className="text-[7.5px] font-bold uppercase tracking-tight text-slate-500 leading-none mb-1">Notas</span>
                        <button
                          type="button"
                          onClick={() => handleOpenNoteBuilder(section.id)}
                          className="p-1 rounded-sm border-2 border-slate-900 bg-sky-500 hover:bg-sky-600 text-slate-950 transition-colors cursor-pointer flex items-center justify-center h-[26px] w-[26px] shadow-geometric"
                          title="Insertar nota adhesiva"
                        >
                          <StickyNote className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Duration edit spinner */}
                      <div className="flex items-center space-x-1 border-2 border-slate-900 px-2 py-0.5 bg-white dark:bg-zinc-950">
                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 select-none font-mono">
                          Mins
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={section.durationMinutes || ""}
                          onChange={(e) => handleSectionChange(section.id, { durationMinutes: parseInt(e.target.value, 10) || 0 })}
                          className="w-8 text-center text-xs font-bold font-mono text-slate-900 dark:text-stone-200 bg-transparent focus:outline-hidden"
                          title="Asignar minutos a esta sección"
                        />
                      </div>

                      {/* Collapse toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(section.id)}
                        className="p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                        title={isExpanded ? "Colapsar editor" : "Expandir editor"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1 rounded-sm hover:bg-red-50 text-slate-400 hover:text-red-650 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Eliminar bloque"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-3.5 bg-amber-50/5 dark:bg-zinc-900/30 border-t border-slate-200 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none font-mono">
                            Contenido Bíblico y Notas de Apoyo
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500 italic font-mono">
                            Agrega citas bíblicas usando el botón + de arriba
                          </span>
                        </div>

                        <RichTextEditor
                          value={section.content}
                          onChange={(newContent: string) => handleSectionChange(section.id, { content: newContent })}
                          onOpenNote={(noteText: string) => handleOpenNoteViewer(noteText)}
                          placeholder="Escribe el borrador, ideas primarias o citas de apoyo. Citas directas de la Biblia (e.g. Mateo 7:24) se colorearán automáticamente."
                          className="w-full min-h-[160px] rounded-none border-2 border-slate-900 p-3.5 text-sm md:text-base font-serif leading-relaxed tracking-wide outline-hidden focus:bg-white dark:border-zinc-850 dark:bg-zinc-950 dark:text-neutral-150 scrollbar-thin resize-y overflow-y-auto cursor-text bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Fast Action: Add Section Form */}
        <form onSubmit={handleAddSection} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Añadir nueva sección (Ej. Punto 4: Práctica de Fe)..."
            className="w-full rounded-none border-2 border-slate-900 px-4 py-3 text-sm bg-white outline-hidden focus:bg-amber-50/5 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            id="new-section-title-input"
          />
          <button
            type="submit"
            className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest border-2 border-slate-900 px-5 transition-all shadow-geometric cursor-pointer shrink-0"
            id="add-section-submit-btn"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Añadir bloque</span>
          </button>
        </form>

        {/* Bible Builder Modal */}
        {activeBibleBuilderSectionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs select-none">
            <div className="relative w-full max-w-2xl overflow-hidden bg-white text-slate-900 shadow-geometric-xl dark:bg-zinc-900 dark:text-neutral-100 border-2 border-slate-900 dark:border-zinc-700 flex flex-col max-h-[85vh]">
              <div className="h-1 w-full bg-amber-500 absolute top-0 left-0" />
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <h3 className="font-serif text-base font-bold">
                    Asistente de Cita Bíblica
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBibleBuilderSectionId(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Breadcrumbs / Progress */}
              <div className="px-5 py-2 bg-slate-50 dark:bg-zinc-950/40 border-b border-slate-200 dark:border-zinc-800 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setBibleBuilderStep("book");
                    setSelectedBook(null);
                    setSelectedChapter(null);
                    setSelectedVerses([]);
                  }}
                  className={`hover:text-amber-500 ${bibleBuilderStep === "book" ? "text-slate-900 dark:text-white underline font-bold" : ""}`}
                >
                  Libro
                </button>
                <span>&gt;</span>
                <button
                  type="button"
                  disabled={!selectedBook}
                  onClick={() => {
                    setBibleBuilderStep("chapter");
                    setSelectedChapter(null);
                    setSelectedVerses([]);
                  }}
                  className={`hover:text-amber-500 disabled:opacity-40 disabled:hover:text-slate-500 ${bibleBuilderStep === "chapter" ? "text-slate-900 dark:text-white underline font-bold" : ""}`}
                >
                  {selectedBook ? selectedBook.abbrev : "Capítulo"}
                </button>
                <span>&gt;</span>
                <span className={bibleBuilderStep === "verse" ? "text-slate-900 dark:text-white underline font-bold" : ""}>
                  {selectedChapter ? `Cap. ${selectedChapter}` : "Versículos"}
                </span>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
                {/* STEP 1: Book Selection */}
                {bibleBuilderStep === "book" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 font-mono">
                        Antiguo Testamento
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {ANTIGUO_TESTAMENTO.map((book) => (
                          <button
                            key={book.abbrev}
                            type="button"
                            onClick={() => handleSelectBook(book)}
                            className="py-1.5 px-1 bg-slate-50 hover:bg-amber-500/20 hover:border-amber-500 text-slate-800 dark:bg-zinc-800 dark:hover:bg-amber-500/20 dark:text-zinc-300 text-xs font-bold border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer text-center truncate"
                            title={book.name}
                          >
                            {book.abbrev}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 font-mono">
                        Nuevo Testamento
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {NUEVO_TESTAMENTO.map((book) => (
                          <button
                            key={book.abbrev}
                            type="button"
                            onClick={() => handleSelectBook(book)}
                            className="py-1.5 px-1 bg-slate-50 hover:bg-amber-500/20 hover:border-amber-500 text-slate-800 dark:bg-zinc-800 dark:hover:bg-amber-500/20 dark:text-zinc-300 text-xs font-bold border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer text-center truncate"
                            title={book.name}
                          >
                            {book.abbrev}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Chapter Selection */}
                {bibleBuilderStep === "chapter" && selectedBook && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 font-mono">
                      Seleccione Capítulo de {selectedBook.name}
                    </h4>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => handleSelectChapter(ch)}
                          className="h-10 w-full flex items-center justify-center bg-slate-100 hover:bg-amber-500/20 hover:border-amber-500 dark:bg-zinc-850 dark:hover:bg-amber-500/20 text-slate-800 dark:text-zinc-300 text-sm font-bold border border-slate-300 dark:border-zinc-700 transition-all cursor-pointer"
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: Verse Selection */}
                {bibleBuilderStep === "verse" && selectedBook && selectedChapter && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                        Seleccione Versículos ({selectedBook.name} {selectedChapter})
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        * Puedes seleccionar múltiples versículos
                      </span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {Array.from({ length: 80 }, (_, i) => i + 1).map((v) => {
                        const isSelected = selectedVerses.includes(v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleToggleVerse(v)}
                            className={`h-10 w-full flex items-center justify-center border transition-all cursor-pointer text-sm font-bold ${
                              isSelected
                                ? "bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-inner"
                                : "bg-slate-100 hover:bg-amber-500/20 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs font-bold select-text text-slate-800 dark:text-zinc-300">
                  <span className="text-slate-400">Referencia:</span>
                  <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-sm rounded-sm">
                    {selectedBook ? (
                      `${selectedBook.name} ${selectedChapter || ""}${
                        selectedVerses.length > 0 ? ":" + formatVerses(selectedVerses) : ""
                      }`
                    ) : (
                      "Ninguno"
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  {bibleBuilderStep !== "book" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (bibleBuilderStep === "verse") {
                          setBibleBuilderStep("chapter");
                          setSelectedVerses([]);
                        } else if (bibleBuilderStep === "chapter") {
                          setBibleBuilderStep("book");
                          setSelectedBook(null);
                        }
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 border-2 border-slate-900 hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Atrás</span>
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleConfirmBibleVerse}
                    disabled={!selectedBook || !selectedChapter}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest border-2 border-slate-900 transition-all shadow-geometric cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>Insertar Cita</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note Builder Modal */}
        {activeNoteBuilderSectionId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4"
          >
            <div className="relative w-full sm:max-w-md overflow-hidden bg-white text-slate-900 shadow-geometric-xl dark:bg-zinc-900 dark:text-neutral-100 border-2 border-slate-900 dark:border-zinc-700 flex flex-col"
              style={{ maxHeight: '90dvh' }}
            >
              <div className="h-1 w-full bg-sky-500 absolute top-0 left-0 z-10" />

              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <StickyNote className="h-5 w-5 text-sky-500" />
                  <h3 className="font-serif text-base font-bold">
                    Crear Nota del Predicador
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNoteBuilderSectionId(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer rounded-full"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                    Contenido de la Nota Adhesiva
                  </label>
                  <textarea
                    autoFocus
                    value={noteBuilderText}
                    onChange={(e) => setNoteBuilderText(e.target.value)}
                    placeholder="Escribe aquí aclaraciones, avisos, o anotaciones que aparecerán como icono en el púlpito..."
                    className="w-full h-32 rounded-none border-2 border-slate-900 p-3 text-sm outline-hidden focus:bg-amber-50/5 dark:bg-zinc-950 dark:text-white dark:border-zinc-850 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="px-5 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/20 flex justify-between gap-3 shrink-0"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveNoteBuilderSectionId(null)}
                  className="flex-1 py-3 border-2 border-slate-900 hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNote}
                  disabled={!noteBuilderText.trim()}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-widest border-2 border-slate-900 transition-all shadow-geometric cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>Insertar Nota</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Viewer Modal */}
        {activeNoteViewerContent && (
          <NoteModal
            content={activeNoteViewerContent}
            onClose={() => setActiveNoteViewerContent(null)}
          />
        )}

        {/* AI Assistant Modal */}
        {aiAssistantSectionId && (
          <AiAssistantModal
            isProUser={isProUser}
            sectionId={aiAssistantSectionId}
            sectionName={sermon.sections.find((s) => s.id === aiAssistantSectionId)?.title || ""}
            currentContent={sermon.sections.find((s) => s.id === aiAssistantSectionId)?.content || ""}
            sermonTitle={sermon.title}
            sermonTheme={sermon.theme}
            onClose={() => setAiAssistantSectionId(null)}
            onInsert={(newContent, mode) => {
              const currentSec = sermon.sections.find((s) => s.id === aiAssistantSectionId);
              if (!currentSec) return;
              const updatedContent = mode === "append" 
                ? (currentSec.content ? currentSec.content + "\n\n" + newContent : newContent)
                : newContent;
              handleSectionChange(aiAssistantSectionId, { content: updatedContent });
              setAiAssistantSectionId(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
