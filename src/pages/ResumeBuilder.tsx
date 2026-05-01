"use client"

import { useState, useRef, useEffect } from "react"

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core"

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

import { supabase } from "../services/supabase"
import RichEditor from "../components/resume/RichEditor"
import { useTheme } from "../components/ui/ThemeContext"

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////
type Section = {
  id: string
  title: string
  content: string
}

type TemplateType = "modern" | "minimal" | "professional"

//////////////////////////////////////////////////////
// DRAG ITEM
//////////////////////////////////////////////////////
function SortableItem({ section, update, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="border p-3 rounded bg-white/5 space-y-2"
    >
      <div className="flex justify-between items-center">
        <input
          value={section.title}
          onChange={(e) => update(section.id, "title", e.target.value)}
          className="bg-transparent w-full text-sm"
        />
        <span {...attributes} {...listeners} className="cursor-move">☰</span>
      </div>

      <RichEditor
        value={section.content}
        onChange={(val) => update(section.id, "content", val)}
      />

      <button onClick={() => remove(section.id)} className="text-red-400 text-sm">
        Remove
      </button>
    </div>
  )
}

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////
export default function ResumeBuilder() {
  const { theme } = useTheme()

  const resumeRef = useRef<HTMLDivElement | null>(null)

  const [mode, setMode] = useState<"home" | "editor">("home")
  const [template, setTemplate] = useState<TemplateType>("modern")

  const [name, setName] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [resumeId, setResumeId] = useState<string | null>(null)

  //////////////////////////////////////////////////////
  // THEME
  //////////////////////////////////////////////////////
  const textBase = theme === "light" ? "text-gray-900" : "text-white"
  const bgCard = theme === "light" ? "bg-white" : "bg-white/5"

  //////////////////////////////////////////////////////
  // LOAD USER RESUME
  //////////////////////////////////////////////////////
  useEffect(() => {
    loadResume()
  }, [])

  const loadResume = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)

    if (data && data.length > 0) {
      const r = data[0]
      setResumeId(r.id)
      setName(r.name)
      setSections(r.sections || [])
      setTemplate(r.template)
    }
  }

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////
  const saveResume = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name,
      sections,
      template
    }

    if (resumeId) {
      await supabase
        .from("resumes")
        .update(payload)
        .eq("id", resumeId)
    } else {
      const { data } = await supabase
        .from("resumes")
        .insert(payload)
        .select()
        .single()

      if (data) setResumeId(data.id)
    }

    alert("Saved!")
  }

  //////////////////////////////////////////////////////
  // DRAG
  //////////////////////////////////////////////////////
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)

    setSections(arrayMove(sections, oldIndex, newIndex))
  }

  //////////////////////////////////////////////////////
  // ACTIONS
  //////////////////////////////////////////////////////
  const addSection = () => {
    setSections(prev => [
      ...prev,
      { id: Date.now().toString(), title: "New Section", content: "" }
    ])
  }

  const updateSection = (id: string, field: string, value: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const startFresh = () => {
    setName("")
    setSections([{ id: Date.now().toString(), title: "Skills", content: "" }])
    setMode("editor")
  }

  const selectTemplate = (t: TemplateType) => {
    setTemplate(t)
    setName("John Doe")
    setSections([
      { id: "1", title: "Skills", content: "<p>React, Node.js</p>" },
      { id: "2", title: "Experience", content: "<p>2 years experience</p>" }
    ])
    setMode("editor")
  }

  //////////////////////////////////////////////////////
  // TEMPLATE RENDER
  //////////////////////////////////////////////////////
  const renderTemplate = () => {
    switch (template) {

      case "modern":
        return (
          <div className="flex text-sm">

            <div className="w-1/3 bg-gray-100 p-4 space-y-3">
              <div className="text-lg font-medium">{name}</div>

              {sections.slice(0, Math.ceil(sections.length / 2)).map(s => (
                <div key={s.id}>
                  <div className="text-xs uppercase text-gray-500">{s.title}</div>
                  <div dangerouslySetInnerHTML={{ __html: s.content }} />
                </div>
              ))}
            </div>

            <div className="w-2/3 p-4 space-y-3">
              {sections.slice(Math.ceil(sections.length / 2)).map(s => (
                <div key={s.id}>
                  <div className="text-xs uppercase text-gray-500">{s.title}</div>
                  <div dangerouslySetInnerHTML={{ __html: s.content }} />
                </div>
              ))}
            </div>

          </div>
        )

      case "minimal":
        return (
          <div className="text-sm space-y-3">
            <div className="text-lg font-medium">{name}</div>

            {sections.map(s => (
              <div key={s.id}>
                <div className="text-xs uppercase text-gray-500">{s.title}</div>
                <div dangerouslySetInnerHTML={{ __html: s.content }} />
              </div>
            ))}
          </div>
        )

      case "professional":
        return (
          <div className="text-sm space-y-4">
            <div className="text-lg font-medium">{name}</div>

            {sections.map(s => (
              <div key={s.id}>
                <div className="border-b pb-1 mb-1 text-xs uppercase">
                  {s.title}
                </div>
                <div dangerouslySetInnerHTML={{ __html: s.content }} />
              </div>
            ))}
          </div>
        )
    }
  }

  //////////////////////////////////////////////////////
  // HOME
  //////////////////////////////////////////////////////
  if (mode === "home") {
    return (
      <div className={textBase}>

        <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">

          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="relative z-10 max-w-3xl w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-10 shadow-2xl">

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Build Your Resume
            </h1>

            <p className="mt-4 text-white/70">
              Create beautiful resumes in minutes
            </p>

            <div className="mt-8 flex justify-center">
              <button
                onClick={startFresh}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Start
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-6">
          {["modern", "minimal", "professional"].map(t => (
            <div
              key={t}
              onClick={() => selectTemplate(t as TemplateType)}
              className={`cursor-pointer p-4 rounded-xl ${bgCard} hover:scale-105 transition`}
            >
              <img
                src={`/templates/${t}.png`}
                className="rounded mb-2 w-full h-40 object-cover"
              />
              <h3 className="capitalize font-medium">{t}</h3>
            </div>
          ))}
        </div>
      </div>
    )
  }

  //////////////////////////////////////////////////////
  // EDITOR
  //////////////////////////////////////////////////////
  return (
    <div className={`grid md:grid-cols-2 gap-6 p-6 ${textBase}`}>

      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 bg-white/10 border rounded"
        />

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SortableItem
                key={section.id}
                section={section}
                update={updateSection}
                remove={removeSection}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button onClick={addSection} className="border px-3 py-1 rounded">
          + Add Section
        </button>

        <div className="flex gap-3">
          <button onClick={saveResume} className="bg-green-600 px-4 py-2 rounded">
            Save
          </button>

          <button onClick={() => window.print()} className="bg-purple-600 px-4 py-2 rounded">
            PDF
          </button>

          <button onClick={() => setMode("home")} className="border px-4 py-2 rounded">
            Back
          </button>
        </div>
      </div>

      <div ref={resumeRef} className="bg-white text-black p-6 rounded">
        {renderTemplate()}
      </div>
</div>
  )
}