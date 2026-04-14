export default function Card({ children }: any) {
  return (
    <div
      className="
      bg-white/5 backdrop-blur-xl
      border border-white/10
      rounded-2xl p-5
      shadow-[0_10px_40px_rgba(0,0,0,0.4)]
      "
    >
      {children}
    </div>
  )
}
