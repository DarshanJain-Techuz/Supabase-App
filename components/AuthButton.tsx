import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // const { data } = await supabase
  //   .from('profiles')
  //   .select(`avatar_url`)
  //   .eq('id', user?.id)
  //   .single()

  const signOut = async () => {
    'use server'
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <>
      <div className="flex items-center gap-4">
        Hey, {user.user_metadata.name || user.email}
        <Link href="/update-profile" className="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Update Profile</Link>
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
