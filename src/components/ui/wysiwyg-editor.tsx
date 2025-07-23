import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';

import { Label } from './label';
import { Button } from './button';

interface WysiwygEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function WysiwygEditor({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter content...", 
  height = 300,
  disabled = false 
}: WysiwygEditorProps) {
  const [showHtmlSource, setShowHtmlSource] = React.useState(false);
  const [htmlContent, setHtmlContent] = React.useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Exclude extensions we're adding separately to avoid duplicates
        link: false,
        horizontalRule: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Typography,
      Highlight,
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (editor) {
      setHtmlContent(editor.getHTML());
    }
  }, [editor, value]);

  const toggleHtmlSource = () => {
    if (showHtmlSource) {
      // Switching back to visual editor - apply HTML changes
      if (editor) {
        editor.commands.setContent(htmlContent);
        onChange(htmlContent);
      }
    } else {
      // Switching to HTML source - get current content
      if (editor) {
        setHtmlContent(editor.getHTML());
      }
    }
    setShowHtmlSource(!showHtmlSource);
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border rounded-md overflow-hidden bg-background">
        {/* Custom Toolbar */}
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            ↷
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <select
            className="text-sm border rounded px-2 py-1 bg-background"
            title="Select heading level"
            aria-label="Select heading level"
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as any }).run();
              }
            }}
            value={
              editor.isActive('paragraph') ? 0 :
              editor.isActive('heading', { level: 1 }) ? 1 :
              editor.isActive('heading', { level: 2 }) ? 2 :
              editor.isActive('heading', { level: 3 }) ? 3 : 0
            }
          >
            <option value={0}>Paragraph</option>
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            ⬅
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            ↔
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            ➡
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            •
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            ☑
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Other Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            "
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            `
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Highlight */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            🖍
          </ToolbarButton>

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            🔗
          </ToolbarButton>

          {/* Image Upload */}
          <ToolbarButton
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const url = reader.result as string;
                    editor.chain().focus().setImage({ src: url }).run();
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            title="Insert Image"
          >
            🖼️
          </ToolbarButton>

          {/* Image URL */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter image URL:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            title="Insert Image from URL"
          >
            📷
          </ToolbarButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* HTML Source Toggle */}
          <ToolbarButton
            onClick={toggleHtmlSource}
            isActive={showHtmlSource}
            title={showHtmlSource ? "Switch to Visual Editor" : "View HTML Source"}
          >
            {'</>'}
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <div className="p-4" style={{ minHeight: height }}>
          {showHtmlSource ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-mono">
                HTML Source Code (you can edit directly):
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
                className="w-full font-mono text-sm border rounded p-3 bg-muted/30"
                style={{ minHeight: height - 60 }}
                placeholder="HTML content will appear here..."
              />
            </div>
          ) : (
            <EditorContent 
              editor={editor} 
              className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:selection:bg-blue-200 [&_.ProseMirror]:selection:text-blue-900 [&_.ProseMirror_*]:selection:bg-blue-200 [&_.ProseMirror_*]:selection:text-blue-900"
            />
          )}
        </div>
      </div>
    </div>
  );
} 