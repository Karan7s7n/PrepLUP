
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export default function RichEditor({
  value,
  onChange
}: {
  value: string
  onChange: (val: string) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  if (!editor) return null

  return (
    <div className="border rounded p-2 bg-white text-black">
      
      {/* Toolbar */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
