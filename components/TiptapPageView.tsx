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
    immediatelyRender: false, // ✅ SSR fix
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
        prose max-w-none p-2 rounded-md shadow-sm
        bg-green-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100
        [&_ul]:list-disc [&_ul]:pl-6 
        [&_ol]:list-decimal [&_ol]:pl-6 
        [&_li]:ml-4
        [&_table]:w-full [&_table]:border [&_table]:border-collapse
        [&_th]:border [&_td]:border [&_th]:px-3 [&_td]:px-3
        [&_th]:py-2 [&_td]:py-2 [&_tr:nth-child(even)]:bg-gray-50 dark:[&_tr:nth-child(even)]:bg-gray-800
      `}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
