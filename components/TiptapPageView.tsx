'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from 'tiptap-extension-font-size';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';

type Props = { value: string };

export default function TiptapPageView({ value }: Props) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Underline,
      Image,
      Link,
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    immediatelyRender: false, // SSR fix
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={`
        prose dark:prose-invert max-w-none
        bg-transparent text-sm lg:text-base
        text-gray-600 dark:text-gray-300
        prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-a:text-orange-500 hover:prose-a:text-orange-600
        prose-img:rounded-xl
        [&_ul]:list-disc [&_ul]:pl-6
        [&_ol]:list-decimal [&_ol]:pl-6
        [&_li]:ml-4
        [&_table]:w-full [&_table]:border-collapse [&_table]:rounded-xl
        [&_th]:border [&_td]:border
        [&_th]:border-gray-100 [&_td]:border-gray-100
        dark:[&_th]:border-white/10 dark:[&_td]:border-white/10
        [&_th]:px-3 [&_td]:px-3 [&_th]:py-2 [&_td]:py-2
        [&_th]:bg-gray-50 dark:[&_th]:bg-white/5
        [&_tr:nth-child(even)_td]:bg-gray-50/60 dark:[&_tr:nth-child(even)_td]:bg-white/[0.03]
      `}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
