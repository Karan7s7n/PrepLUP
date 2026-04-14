export function analyzeResume(data: any) {
  let score = 0
  const tips: string[] = []

  if (data.summary.length > 50) score += 2
  else tips.push("Add a stronger summary")

  if (data.skills.length > 3) score += 2
  else tips.push("Add more skills")

  if (data.experience.length > 0) score += 3
  else tips.push("Add experience section")

  return {
    score,
    tips,
  }
}
