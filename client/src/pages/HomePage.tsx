import { Link } from 'react-router-dom'
import { Search, Layers, Shield, ChevronRight, Zap } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'ค้นหาการ์ด',
    titleEn: 'Card Search',
    desc: 'ค้นหาการ์ดด้วยชื่อภาษาไทย/อังกฤษ กรองตาม Faction, ต้นทุน, ประเภท และความหายาก',
    link: '/cards',
    color: 'from-blue-900/40 to-marvel-card border-blue-800',
    btn: 'ค้นหาการ์ด',
  },
  {
    icon: Layers,
    title: 'สร้างเดค',
    titleEn: 'Deck Builder',
    desc: 'สร้างและจัดการเดคการ์ดของคุณ เพิ่ม/ลบการ์ด บันทึกเดค และแบ่งปันกับผู้อื่น',
    link: '/deck-builder',
    color: 'from-purple-900/40 to-marvel-card border-purple-800',
    btn: 'สร้างเดค',
  },
  {
    icon: Shield,
    title: 'Meta Decks',
    titleEn: 'Meta Decks',
    desc: 'เดคที่แนะนำสำหรับ Meta ปัจจุบัน พร้อมอัตราการชนะและสไตล์การเล่น',
    link: '/meta-decks',
    color: 'from-red-900/40 to-marvel-card border-red-800',
    btn: 'ดู Meta Decks',
  },
]

const stats = [
  { label: 'การ์ดทั้งหมด', value: '40+', icon: Zap },
  { label: 'Factions', value: '9', icon: Shield },
  { label: 'Meta Decks', value: '4', icon: Layers },
  { label: 'อัปเดต Patch', value: '1.0', icon: Search },
]

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center py-12 space-y-6">
        <div className="inline-flex items-center gap-2 bg-marvel-red/20 border border-marvel-red/40 text-marvel-red rounded-full px-4 py-1.5 text-sm font-semibold mb-2">
          <Zap size={14} />
          Patch 1.0 - Live Now
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-wider text-white">
          MARVEL <span className="text-marvel-red">DUEL</span>
        </h1>
        <p className="text-xl md:text-2xl font-marvel tracking-widest text-gray-400">
          CARD DATABASE
        </p>
        <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
          ฐานข้อมูลการ์ด Marvel Duel ครบครัน ค้นหา กรอง และสร้างเดคในที่เดียว
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/cards" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            <Search size={18} />
            ค้นหาการ์ด
          </Link>
          <Link to="/deck-builder" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
            <Layers size={18} />
            สร้างเดค
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-marvel-card border border-marvel-border rounded-xl p-5 text-center"
          >
            <Icon className="mx-auto mb-2 text-marvel-red" size={24} />
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, titleEn, desc, link, color, btn }) => (
          <Link
            key={title}
            to={link}
            className={`bg-gradient-to-b ${color} border rounded-2xl p-6 space-y-4 card-hover group`}
          >
            <div className="w-12 h-12 bg-marvel-red/20 rounded-xl flex items-center justify-center text-marvel-red group-hover:bg-marvel-red group-hover:text-white transition-all">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{title}</h3>
              <p className="text-gray-500 text-sm">{titleEn}</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            <div className="flex items-center gap-1 text-marvel-red font-semibold text-sm group-hover:gap-2 transition-all">
              {btn}
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm pb-8 border-t border-marvel-border pt-8">
        <p>Marvel Duel Card Database © 2026 • ไม่ใช่เนื้อหาทางการของ Marvel</p>
      </div>
    </div>
  )
}
