'use client'
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthButton() {
  const [avatarUrl, setAvatarUrl] = useState('')
  const [user, setUser] = useState<User | null>()
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    async function downloadImage() {
      try {
        const avatar = await supabase
          .from('profiles')
          .select(`avatar_url`)
          .eq('id', user?.id)
          .single().then(async ({ data }) => {
            const { data: imageData } = await supabase.storage.from('profile_picture').download(data?.avatar_url)
            return URL.createObjectURL(imageData!)
          })
        setAvatarUrl(avatar)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }
    if (user) { downloadImage() }
  }, [user])

  const signOut = async () => {
    await supabase.auth.signOut();
    return redirect("/login");
  };


  return user ? (
    <>
      <div className="flex items-center gap-4">
        Hey {user.user_metadata.name || user.email}
        <Link href="/update-profile" className="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"><Image
          width={40}
          height={40}
          src={avatarUrl ? avatarUrl : '/user-profile-icon.jpg'}
          alt="Avatar"
          className="avatar image"
          style={{
            height: 40,
            width: 40,
            borderRadius: '50%', // Makes the avatar circular
            objectFit: 'cover', // Ensures the image covers the area without stretching
            backgroundColor: '#f0f0f0', // Background color for the avatar
            padding: '2px', // Adds some padding around the avatar
            border: '1px solid #ccc', // Adds a border around the avatar
            display: 'inline-block', // Ensure the image is displayed inline
            verticalAlign: 'middle',
          }}
        /></Link>
        <form action={signOut}>
          <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
            Logout
          </button>
        </form>
      </div>
    </>) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login
    </Link>
  );
}
