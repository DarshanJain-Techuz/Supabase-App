'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [contactNumber, setContactNumber] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [username, setUsername] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`contact_no, username, website, avatar_url, bio`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setContactNumber(data.contact_no)
        setBio(data.bio)
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.log('error', error)
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({ url }: { url: string | null }) {
    try {
      setLoading(true)

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        contact_no: contactNumber,
        bio,
        avatar_url: url,
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      console.log('error', error)
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-8 mt-10">
        <Avatar
          uid={user?.id ?? null}
          url={avatar_url}
          size={150}
          onUpload={(url) => {
            setAvatarUrl(url)
            updateProfile({ url })
          }}
        />
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="text" value={user?.email} disabled className="mt-1 p-2 w-full rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="mb-4">
          <label htmlFor="contact_no" className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            id="contact_no"
            type="text"
            value={contactNumber || ''}
            onChange={(e) => setContactNumber(e.target.value)}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <button className="button block mt-4 bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 relative" type="submit" onClick={() => updateProfile({ url: avatar_url })}>
            Submit
          </button>
        </div>
      </div>
    </>
  )
}