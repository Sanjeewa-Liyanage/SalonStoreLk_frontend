'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { WhatsApp, Instagram, Facebook, Email } from '@mui/icons-material';
import { ChevronDown, Menu, Search, X, User, LogOut, Settings, Check,  } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English (UK)', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', flag: '🇱🇰' },
];

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export default function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)
        && mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLanguage(lang: typeof LANGUAGES[0]) {
    setSelectedLang(lang);
    setIsLangOpen(false);
    document.documentElement.lang = lang.code;
  }

  function handleLegacyNavigation(page: string) {
    if (onNavigate) {
      onNavigate(page);
      return;
    }

    if (page === 'publish') {
      router.push('/auth/register');
      return;
    }

    if (page === 'contact') {
      router.push('/find-salon');
    }
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // ── Language button with dropdown ──
  function LangButton({ refProp, above = false }: { refProp: React.RefObject<HTMLDivElement | null>; above?: boolean }) {
    return (
      <div className="relative" ref={refProp}>
        <button
          onClick={() => setIsLangOpen((p) => !p)}
          className="flex items-center gap-1 bg-black/10 hover:bg-black/20 border border-black/20 rounded-lg px-2.5 py-2 transition-colors"
          aria-haspopup="listbox"
          aria-expanded={isLangOpen}
          title={selectedLang.label}
        >
          <span className="text-lg leading-none select-none">{selectedLang.flag}</span>
          <ChevronDown size={12} className={`text-black/60 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
        </button>
        {isLangOpen && (
          <div
            className={`absolute right-0 ${above ? 'bottom-full mb-2' : 'top-full mt-1.5'} w-44 bg-white border border-black/10 rounded-xl shadow-2xl overflow-hidden z-[9999]`}
            role="listbox"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={selectedLang.code === lang.code}
                onClick={() => selectLanguage(lang)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors ${selectedLang.code === lang.code ? 'bg-amber-50' : ''}`}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <div className="flex flex-col items-start leading-tight">
                  <span className={`text-black ${selectedLang.code === lang.code ? 'font-semibold' : ''}`}>{lang.label}</span>
                  <span className="text-black/40 text-xs">{lang.nativeLabel}</span>
                </div>
                {selectedLang.code === lang.code && <Check size={13} className="ml-auto text-amber-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Initials avatar fallback ──
  function Initials({ name }: { name: string }) {
    const letters = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <span className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center flex-shrink-0 select-none">
        {letters}
      </span>
    );
  }

  // ── User section (desktop) ──
  function UserSection() {
    if (!user) {
      return (
        <button
          onClick={() => router.push('/auth/login')}
          className="flex items-center gap-2 bg-black/10 hover:bg-black/20 border border-black/20 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <User size={15} />
          Sign In
        </button>
      );
    } 

    const displayName: string = user.firstName || user.lastName
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'User'
      : user.name || 'User';

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 bg-black/10 hover:bg-black/20 border border-black/20 rounded-lg px-3 py-1.5 transition-colors"
          aria-haspopup="true"
          aria-expanded={isUserMenuOpen}
        >
          {user.avatarUrl ? (
            <Image src={user.avatarUrl as string} alt={displayName} width={28} height={28} className="rounded-full object-cover" />
          ) : (
            <Initials name={displayName} />
          )}
          <span className="text-black text-sm font-semibold max-w-[120px] truncate">{displayName}</span>
          <ChevronDown
            size={13}
            className={`text-black/60 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-black/10 rounded-xl shadow-2xl overflow-hidden z-[9999]">
            <div className="px-4 py-3 border-b border-black/5">
              <p className="text-xs text-black/50 leading-none mb-0.5">Signed in as</p>
              <p className="text-sm font-semibold text-black truncate">{displayName}</p>
            </div>
            <button
              onClick={() => { setIsUserMenuOpen(false); onNavigate?.('profile'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-black hover:bg-amber-50 transition-colors"
            >
              <User size={14} className="text-black/50" />
              My Profile
            </button>
            <button
              onClick={() => { setIsUserMenuOpen(false); onNavigate?.('settings'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-black hover:bg-amber-50 transition-colors"
            >
              <Settings size={14} className="text-black/50" />
              Settings
            </button>
            <div className="border-t border-black/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="bg-[#D4A017] sticky top-0 z-50 shadow-md">

      {/* ── DESKTOP NAVBAR ── */}
      <div className="hidden md:flex items-center gap-6 px-6 py-3">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none flex-shrink-0"
          aria-label="Go to homepage"
        >
          <Image
            src="/logo.png"
            alt="SalonStore.lk"
            width={48}
            height={48}
            className="rounded-full object-cover border-2 border-black/10"
            priority
          />
          <span className="text-black font-bold text-lg tracking-tight leading-tight">
            SalonStore<span className="text-white">.lk</span>
          </span>
        </Link>

        <div className="w-px h-8 bg-black/20 flex-shrink-0" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/find-salon"
            className={`px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-black/10 ${
              currentPage === 'find' ? 'bg-black/15 text-black' : 'text-black/80'
            }`}
          >
            Find Salons
          </Link>
          <button
            onClick={() => handleLegacyNavigation('publish')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-black/10 ${
              currentPage === 'publish' ? 'bg-black/15 text-black' : 'text-black/80'
            }`}
          >
            Publish Your Salon
          </button>
          <button
            onClick={() => handleLegacyNavigation('contact')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-black/10 ${
              currentPage === 'contact' ? 'bg-black/15 text-black' : 'text-black/80'
            }`}
          >
            Contact Us
          </button>
        </nav>

        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <InputGroup className="w-52 bg-white/90 border-black/20 focus-within:border-black/40">
            <InputGroupAddon align="inline-start">
              <Search size={14} className="text-black/60" />
            </InputGroupAddon>
            <Input
              type="search"
              placeholder="Search salons…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="border-0 shadow-none bg-transparent text-black placeholder:text-black/50 text-sm focus-visible:ring-0"
            />
          </InputGroup>

          {/* Social icons */}
          <div className="flex items-center gap-0.5">
            <a href="#" aria-label="WhatsApp" className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors">
              <WhatsApp sx={{ fontSize: 18, color: 'black' }} />
            </a>
            <a href="#" aria-label="Instagram" className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors">
              <Instagram sx={{ fontSize: 18, color: 'black' }} />
            </a>
            <a href="#" aria-label="Facebook" className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors">
              <Facebook sx={{ fontSize: 18, color: 'black' }} />
            </a>
            <a href="#" aria-label="Email" className="w-7 h-7 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors">
              <Email sx={{ fontSize: 18, color: 'black' }} />
            </a>
          </div>

          {/* Language */}
          <LangButton refProp={langRef} />

          {/* Auth */}
          <UserSection />
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
            <Image
              src="/logo.png"
              alt="SalonStore.lk"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-black/10"
              priority
            />
            <span className="text-black font-bold text-base tracking-tight">
              SalonStore<span className="text-white">.lk</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/80 rounded-lg px-3 py-1.5 gap-2">
              <input
                type="text"
                placeholder="Search salons…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-28 bg-transparent outline-none text-sm text-black placeholder:text-black/50"
              />
              <Search size={15} className="text-black/60 flex-shrink-0" />
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-black/10 rounded transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="bg-black/95 text-white py-4 px-4 space-y-1">
            <Link href="/find-salon" onClick={() => setIsMenuOpen(false)} className="block w-full text-left px-4 py-2.5 hover:bg-white/10 rounded transition text-sm">Find Salons</Link>
            <button onClick={() => { handleLegacyNavigation('publish'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-white/10 rounded transition text-sm">Publish Your Salon</button>
            <button onClick={() => { handleLegacyNavigation('contact'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 hover:bg-white/10 rounded transition text-sm">Contact Us</button>

            <div className="border-t border-white/10 pt-3 mt-2 flex items-center justify-between px-2">
              {/* Social icons */}
              <div className="flex items-center gap-2">
                <a href="#" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
                  <WhatsApp sx={{ fontSize: 18, color: 'white' }} />
                </a>
                <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                  <Instagram sx={{ fontSize: 18, color: 'white' }} />
                </a>
                <a href="#" aria-label="Facebook" className="hover:opacity-70 transition-opacity">
                  <Facebook sx={{ fontSize: 18, color: 'white' }} />
                </a>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile auth */}
                <LangButton refProp={mobileLangRef} above />
                {!user ? (
                  <button
                    onClick={() => { router.push('/login'); setIsMenuOpen(false); }}
                    className="flex items-center gap-1.5 bg-[#D4A017] text-black text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    <User size={14} />
                    Sign In
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl as string} alt={user.name || 'User'} width={28} height={28} className="rounded-full object-cover" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-[#D4A017] text-black text-xs font-bold flex items-center justify-center">
                        {((user.firstName || user.name || 'U') as string).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="text-white text-sm font-medium">{user.firstName || user.name || 'User'}</span>
                    <button
                      onClick={handleLogout}
                      className="ml-1 text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}