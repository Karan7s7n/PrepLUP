import { useRef, useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ResumeBuilder() {
  const resumeRef = useRef<HTMLDivElement | null>(null)

  const [name, setName] = useState("")
  const [skills, setSkills] = useState("")

  const downloadPDF = async () => {
    if (!resumeRef.current) return

    const canvas = await html2canvas(resumeRef.current)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF()

const imgProps = pdf.getImageProperties(imgData)
const pdfWidth = pdf.internal.pageSize.getWidth()
const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save("resume.pdf")
  }

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 text-white">
      
      {/* FORM */}
      <div className="space-y-4">
        <input
          className="w-full p-2 bg-white/10 border border-white/20 rounded"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-2 bg-white/10 border border-white/20 rounded"
          placeholder="Skills"
          onChange={(e) => setSkills(e.target.value)}
        />

        <button
          onClick={downloadPDF}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      {/* PREVIEW */}
      <div
        ref={resumeRef}
        className="bg-white text-black p-6 rounded"
      >
        <h1 className="text-xl font-bold">{name}</h1>
        <p>{skills}</p>
      </div>

    </div>
  )
}
