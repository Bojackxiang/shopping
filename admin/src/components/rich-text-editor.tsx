'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string; // 新增：最小高度
  maxHeight?: string; // 新增：最大高度
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write your content here...',
  className,
  minHeight = '200px', // 默认最小高度
  maxHeight = '400px' // 默认最大高度
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-4',
        style: `color: var(--foreground);`
      }
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div
      className={cn('flex flex-col rounded-lg border', className)}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)'
      }}
    >
      {/* Toolbar - Fixed at top */}
      <div
        className='flex flex-shrink-0 flex-wrap gap-1 border-b p-2'
        style={{ borderColor: 'var(--border)' }}
      >
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          title='Heading 2'
        >
          <Heading2 className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          title='Bullet List'
        >
          <List className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => {
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          title='Numbered List'
        >
          <ListOrdered className='h-4 w-4' />
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className='h-4 w-4' />
        </Button>

        <Button type='button' variant='ghost' size='sm' onClick={addImage}>
          <ImageIcon className='h-4 w-4' />
        </Button>

        <div className='ml-auto flex gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className='h-4 w-4' />
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Editor Content - Scrollable container */}
      <div
        className='overflow-y-auto'
        style={{
          minHeight: minHeight,
          maxHeight: maxHeight
        }}
      >
        <EditorContent editor={editor} className='rich-text-content' />
      </div>

      {/* Editor Styles */}
      <style jsx global>{`
        .rich-text-content .ProseMirror {
          outline: none;
        }

        .rich-text-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .rich-text-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .rich-text-content li {
          margin: 0.25rem 0;
          color: var(--foreground);
        }

        .rich-text-content p {
          margin: 0.5rem 0;
          color: var(--foreground);
        }

        .rich-text-content strong {
          font-weight: 600;
        }

        .rich-text-content em {
          font-style: italic;
        }

        .rich-text-content a {
          color: var(--primary);
          text-decoration: underline;
        }

        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
