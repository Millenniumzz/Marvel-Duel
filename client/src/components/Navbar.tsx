import { Link, NavLink } from 'react-router-dom'
import { Layers, Search, Shield, Star } from 'lucide-react'

const navItems = [
  { to: '/', label: 'หน้าหลัก', icon: Star },
  { to: '/cards', label: 'การ์ดทั้งหมด', icon: Search },
  { to: '/deck-builder', label: 'สร้างเดค', icon: Layers },
  { to: '/meta-decks', label: 'Meta Decks', icon: Shield },
]

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-marvel-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-marvel-red rounded-full flex items-center justify-center font-marvel text-sm font-black group-hover:scale-110 transition-transform">
              M
            </div>
            <span className="font-marvel text-xl tracking-widest text-white">
              MARVEL <span className="text-marvel-red">DUEL</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-marvel-red text-white'
                      : 'text-gray-400 hover:text-white hover:bg-marvel-card'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1">
            {navItems.map(({ to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-marvel-red text-white'
                      : 'text-gray-400 hover:text-white hover:bg-marvel-card'
                  }`
                }
              >
                <Icon size={20} />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
