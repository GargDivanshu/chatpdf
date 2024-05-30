import React from 'react'
import { UserButton, auth } from "@clerk/nextjs";
import Link from 'next/link'


const Navbar = () => {
  return (
    <nav className="flex flex-row justify-between gap-4 p-6">
        <span className="text-3xl font-semibold"><Link href="/">Chat with Pdf</Link></span> 
        <UserButton afterSignOutUrl="/" />
      </nav>
  )
}

export default Navbar