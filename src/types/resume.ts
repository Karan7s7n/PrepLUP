export interface ResumeData {
  name: string
  email: string
  phone: string
  summary: string
  skills: string[]
  experience: {
    company: string
    role: string
    duration: string
    description: string
  }[]
  education: {
    school: string
    degree: string
    year: string
  }[]
}
