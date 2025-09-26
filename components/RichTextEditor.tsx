'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded p-3 font-mono text-sm',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 min-h-[300px] focus:outline-none',
        style: 'line-height: 1.6; font-size: 16px;',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!isMounted) {
    return (
      <div className="border border-gray-300 rounded-lg p-8 bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading editor...</span>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Enhanced Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors ${
                editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded text-sm italic hover:bg-gray-200 transition-colors ${
                editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded text-sm line-through hover:bg-gray-200 transition-colors ${
                editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Strikethrough"
            >
              S
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`px-2 py-1 rounded text-sm font-mono bg-gray-100 hover:bg-gray-200 transition-colors ${
                editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Inline Code"
            >
              {'</>'}
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
                editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Paragraph"
            >
              P
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
                editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Numbered List"
            >
              1. List
            </button>
          </div>

          {/* Special Formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
                editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Quote"
            >
              &quot; Quote
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`px-2 py-1 rounded text-sm font-mono hover:bg-gray-200 transition-colors ${
                editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Code Block"
            >
              {'{ }'}
            </button>
          </div>

          {/* Media & Links */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={addLink}
              className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
                editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
              }`}
              title="Add Link"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={addImage}
              className="px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors text-gray-700"
              title="Add Image"
            >
              🖼️ Image
            </button>
          </div>

          {/* Utilities */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors text-gray-700"
              title="Horizontal Rule"
            >
              ―――
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              className="px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors text-gray-700"
              title="Clear Formatting"
            >
              ✗ Clear
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="min-h-[300px] max-h-[600px] overflow-y-auto"
        />
        
        {/* Enhanced Placeholder */}
        {editor.isEmpty && placeholder && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Word Count & Status */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-500 flex justify-between items-center">
        <div>
          Words: {editor.storage.characterCount?.words() || 0} | 
          Characters: {editor.storage.characterCount?.characters() || 0}
        </div>
        <div className="text-xs">
          Rich text editor with formatting tools - Try selecting text and using the toolbar
        </div>
      </div>
    </div>
  );
}