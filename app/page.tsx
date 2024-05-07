'use client'
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/client";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Index() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user)
    }
    getUser()
  }, [supabase])

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        <Link href='/'>
          <Image src='/Logo.svg' priority alt='company logo' width={150} height={150} />
        </Link>
        {user && (
          <div className="border border-gray-300 rounded-md py-1 px-3">
            <Link href='/dashboard' className="text-gray-800 hover:text-gray-900 font-semibold">Dashboard</Link>
          </div>
        )}
        <AuthButton />
      </div>
    </nav>
  
    <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
      <Header />
      <main className="flex-1 flex flex-col gap-6">
        <h2 className="font-bold text-4xl mb-4">Next steps</h2>
        <SignUpUserSteps />
      </main>
    </div>
  
    <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
      <p>
        Demo of Supabase with NextJS by{" "}
        <a
          href="https://www.techuz.com"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Techuz
        </a>
      </p>
    </footer>
  </div>
  )  
}
