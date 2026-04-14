"use client"

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { useTheme } from "../components/ui/ThemeContext"

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  //////////////////////////////////////////////////////
  // LOAD USER + PROFILE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data.user

      setUser(currentUser)

      if (!currentUser) return

      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle()

      // AUTO CREATE IF NOT EXISTS
      if (!profileData) {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            name: "",
            avatar_url: ""
          })
          .select()
          .single()

        profileData = newProfile
      }

      setName(profileData?.name || "")
    }

    load()
  }, [])

  //////////////////////////////////////////////////////
  // UPDATE PROFILE
  //////////////////////////////////////////////////////
  const updateProfile = async () => {
    if (!user) return

    setLoading(true)
    setSaved(false)

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: name,
        email: user.email,
        updated_at: new Date().toISOString()
      })

    setLoading(false)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      console.error(error)
      alert("Failed to update profile")
    }
  }

  //////////////////////////////////////////////////////
  // RESET PASSWORD
  //////////////////////////////////////////////////////
  const resetPassword = async () => {
    if (!user?.email) return

    const { error } = await supabase.auth.resetPasswordForEmail(user.email)

    if (!error) {
      alert("Password reset email sent!")
    } else {
      console.error(error)
      alert("Error sending reset email")
    }
  }

  //////////////////////////////////////////////////////
  // THEME
  //////////////////////////////////////////////////////
  const text = theme === "light" ? "text-gray-900" : "text-white"

  const card =
    theme === "light"
      ? "bg-white/70 border-gray-200"
      : "bg-white/10 border-white/20"

  const input =
    theme === "light"
      ? "bg-white border-gray-300"
      : "bg-white/10 border-white/20"

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className={`min-h-screen ${text} px-6 py-12 relative`}>

      {/* BACKGROUND */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-150px] right-[-150px]" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="opacity-70 mt-2">
            Manage your account, preferences, and security
          </p>
        </div>

        {/* ACCOUNT */}
        <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl ${card}`}>
          <h2 className="text-lg font-semibold mb-6">Account</h2>

          <div className="space-y-4">

            <input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder={name ? name : "Enter your name"}
  className={`w-full p-3 rounded-xl border outline-none ${input}`}
/>

            <input
              value={user?.email || ""}
              disabled
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 opacity-60"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:opacity-90 transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              {saved && (
                <span className="text-green-400 text-sm">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* APPEARANCE */}
        <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl ${card}`}>
          <h2 className="text-lg font-semibold mb-6">Appearance</h2>

          <div className="flex items-center justify-between">
            <span className="opacity-80">Dark Mode</span>

            <button
              onClick={toggleTheme}
              className={`
                w-14 h-8 flex items-center rounded-full p-1 transition
                ${theme === "dark" ? "bg-purple-600" : "bg-gray-300"}
              `}
            >
              <div
                className={`
                  w-6 h-6 bg-white rounded-full shadow-md transform transition
                  ${theme === "dark" ? "translate-x-6" : "translate-x-0"}
                `}
              />
            </button>
          </div>
        </div>

        {/* SECURITY */}
        <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl ${card}`}>
          <h2 className="text-lg font-semibold mb-6">Security</h2>

          <button
            onClick={resetPassword}
            className="px-5 py-2 rounded-xl border hover:bg-white/10 transition"
          >
            Reset Password
          </button>
        </div>

        {/* DANGER ZONE */}
        <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl ${card}`}>
          <h2 className="text-lg font-semibold mb-6 text-red-400">
            Danger Zone
          </h2>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/auth"
            }}
            className="px-6 py-2 rounded-xl bg-red-500 text-white hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}