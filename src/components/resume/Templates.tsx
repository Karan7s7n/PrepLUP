export function MinimalTemplate({ data }: any) {
  return (
    <div className="p-6 text-sm">
      <h1 className="text-xl font-bold">{data.name}</h1>
      <p>{data.email}</p>
      <p>{data.summary}</p>
    </div>
  )
}

export function ModernTemplate({ data }: any) {
  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p>{data.email}</p>
      <p className="mt-2">{data.summary}</p>
    </div>
  )
}
