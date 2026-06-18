'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-gradient">Aura</span>
            <span className="text-2xl font-bold text-white">Kinematics</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {links.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="relative px-3 py-2 text-sm font-medium hover:text-white transition-colors"
                  >
                    <span className={isActive ? 'text-white' : 'text-[#94A3B8]'}>{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-green"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
