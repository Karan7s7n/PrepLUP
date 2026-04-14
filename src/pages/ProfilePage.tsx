"use client"

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { useTheme } from "../components/ui/ThemeContext"

export default function ProfilePage() {
  const { theme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [openEdit, setOpenEdit] = useState(false)

  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  //////////////////////////////////////////////////////
  // LOAD USER + PROFILE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data.user

      setUser(currentUser)

      if (!currentUser) {
        setLoading(false)
        return
      }

      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle()

      // AUTO CREATE PROFILE IF NOT EXISTS
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

      setProfile(profileData)
      setLoading(false)
    }

    getUser()
  }, [])

  //////////////////////////////////////////////////////
  // UPDATE PROFILE
  //////////////////////////////////////////////////////
  const updateProfile = async () => {
    if (!user) return

    setSaving(true)

    const { error, data } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: name,
        avatar_url: avatarUrl,
        email: user.email
      })
      .select()
      .single()

    setSaving(false)

    if (!error) {
      setProfile(data)
      setOpenEdit(false)
    } else {
      console.error(error)
      alert("Error updating profile")
    }
  }

  //////////////////////////////////////////////////////
  // THEME
  //////////////////////////////////////////////////////
  const text = theme === "light" ? "text-gray-900" : "text-white"

  //////////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="opacity-70">Loading profile...</p>
      </div>
    )
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className={`min-h-screen ${text} flex items-center justify-center px-6 relative overflow-hidden`}>

      {/* BACKGROUND */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl p-8 text-center">

        {/* AVATAR */}
        <div className="flex justify-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* NAME */}
        <h2 className="mt-4 text-2xl font-semibold">
          {profile?.name || "Your Name"}
        </h2>

        {/* EMAIL */}
        <p className="text-sm opacity-70">
          {user?.email}
        </p>

        {/* ACTIONS */}
        <div className="mt-6 space-y-3">

          <button
            onClick={() => {
              setName(profile?.name || "")
              setAvatarUrl(profile?.avatar_url || "")
              setOpenEdit(true)
            }}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/auth"
            }}
            className="w-full py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Logout
          </button>

        </div>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenEdit(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

            <h3 className="text-xl font-semibold mb-4">
              Edit Profile
            </h3>

            {/* NAME */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 mb-3 outline-none"
            />

            {/* AVATAR URL */}
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Avatar URL"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 mb-4 outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={updateProfile}
                disabled={saving}
                className="flex-1 py-2 rounded bg-blue-600 text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setOpenEdit(false)}
                className="flex-1 py-2 rounded border"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}