'use client';

import { ButtonWithLink, Button } from "../ui/Button"
import { useAuth } from "@/context/AuthContext"

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="border-b">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">SecureFiles</h1>
      </div>
      <div className="flex gap-2">
      {!user ? (
        <ButtonWithLink label='Sign In' link="/login" />
      ) : (
        <Button label='Sign Out' onClick={logout} />
      )}
      </div>
    </div>
  </header>
  )
}

export default Header