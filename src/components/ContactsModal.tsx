import React, { useState, useEffect } from 'react';
import { ContactUser, UserProfile, ContactMatchResult } from '../types/ludo';
import { notificationService } from '../utils/notifications';
import {
  Search,
  Phone,
  Globe,
  MapPin,
  Users,
  Zap,
  UserPlus,
  UserCheck,
  Share2,
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Play,
  Copy,
  Smartphone,
  Bell,
  BellRing,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Send,
} from 'lucide-react';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  authToken?: string | null;
  onInviteContact?: (contact: ContactUser) => void;
  onInviteUser?: (contact: any) => void;
  onOpenAuth?: () => void;
  onNotifyContactPlaying?: (contactName: string, mode?: string, roomCode?: string) => void;
  onSendWhatsAppInvite?: (contactPhone: string, contactName?: string) => void;
}

// Sample device address book contacts for simulation/demo if Web Contacts API is not natively available
const DEFAULT_DEVICE_CONTACTS = [
  { name: 'David Miller (Best Friend)', tel: '+1 (555) 234-5678', email: 'david@example.com' },
  { name: 'Sarah Connor (Sister)', tel: '+44 7700 900123', email: 'sarah@example.com' },
  { name: 'Raj Patel (Colleague)', tel: '+91 98765 43210', email: 'raj@example.com' },
  { name: 'Alex Smith (Gym Buddy)', tel: '+1 (416) 555-0199', email: 'alex@example.com' },
  { name: 'Samira Khan (Cousin)', tel: '+971 50 123 4567', email: 'samira@example.com' },
];

const COUNTRY_DIAL_CODES = [
  { code: '+92', flag: '🇵🇰', name: 'Pakistan (+92)' },
  { code: '+91', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+971', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi (+966)' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh (+880)' },
  { code: '+49', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+61', flag: '🇦🇺', name: 'Australia (+61)' },
];

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onInviteContact,
  onInviteUser,
  onOpenAuth,
  onNotifyContactPlaying,
  onSendWhatsAppInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'playing_contacts' | 'online' | 'contacts' | 'search'>('whatsapp');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedContactIds, setSavedContactIds] = useState<string[]>(currentUser?.contacts || []);
  const [copiedLink, setCopiedLink] = useState(false);

  // WhatsApp & Phone Pickup State
  const [selectedCountryCode, setSelectedCountryCode] = useState('+92');
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('');
  const [whatsappNameInput, setWhatsappNameInput] = useState('');
  const [nativePickerSupported, setNativePickerSupported] = useState(false);
  const [checkedContactResult, setCheckedContactResult] = useState<{
    phone: string;
    name: string;
    isRegistered: boolean;
    user?: any;
    isOnline?: boolean;
    isPlaying?: boolean;
  } | null>(null);

  // Device Contacts Permission & Matches State
  const [hasAcceptedContactsPermission, setHasAcceptedContactsPermission] = useState<boolean>(() => {
    return localStorage.getItem('ludo_contacts_accepted') === 'true';
  });
  const [isPermissionPromptOpen, setIsPermissionPromptOpen] = useState(false);
  const [matchedContacts, setMatchedContacts] = useState<ContactMatchResult[]>([]);
  const [isScanningContacts, setIsScanningContacts] = useState(false);
  const [customPhoneInput, setCustomPhoneInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);

  const inviteHandler = onInviteContact || onInviteUser;

  // Detect Native Contact Picker API support (Chrome on Android / PWA)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      setNativePickerSupported(true);
    }
  }, []);

  // Fetch directory users
  const fetchUsers = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers(searchQuery);
      if (currentUser?.contacts) {
        setSavedContactIds(currentUser.contacts);
      }
      if (hasAcceptedContactsPermission && matchedContacts.length === 0) {
        syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, false);
      }
    }
  }, [isOpen, searchQuery, currentUser]);

  // Synchronize contact list with backend and notify user if any contact is playing
  const syncDeviceContacts = async (
    contactsToSync: Array<{ name: string; tel?: string | string[]; email?: string | string[] }>,
    showNotificationToasts = true
  ) => {
    setIsScanningContacts(true);
    setScanStatusMessage('Scanning contact list and checking who is playing Ludo...');

    try {
      const res = await fetch('/api/contacts/check-device-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: contactsToSync }),
      });
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        setMatchedContacts(data.matches);

        const playingFriends = data.matches.filter((m: ContactMatchResult) => m.isPlaying);
        const onlineFriends = data.matches.filter((m: ContactMatchResult) => m.isOnline);

        if (showNotificationToasts) {
          if (playingFriends.length > 0) {
            const firstPlaying = playingFriends[0];
            setScanStatusMessage(
              `🎉 ${playingFriends.length} friend${playingFriends.length > 1 ? 's' : ''} from your contacts ${
                playingFriends.length > 1 ? 'are' : 'is'
              } currently playing Ludo! Tap "Challenge" to play together.`
            );

            notificationService.sendContactPlayingNotification(
              firstPlaying.contactName,
              firstPlaying.currentMode || 'Championship Match',
              firstPlaying.currentRoomCode
            );

            if (onNotifyContactPlaying) {
              onNotifyContactPlaying(
                firstPlaying.contactName,
                firstPlaying.currentMode,
                firstPlaying.currentRoomCode
              );
            }
          } else if (onlineFriends.length > 0) {
            setScanStatusMessage(
              `🟢 ${onlineFriends.length} contact${onlineFriends.length > 1 ? 's' : ''} found registered and online in Ludo!`
            );
          } else {
            setScanStatusMessage(
              `Found ${data.matches.length} contacts registered in Ludo. Send them a WhatsApp invite to come online!`
            );
          }
        }
      } else {
        setScanStatusMessage(
          'No matching contacts found currently playing. Pick a phone number below to invite via WhatsApp!'
        );
      }
    } catch (err) {
      console.error('Error syncing device contacts:', err);
      setScanStatusMessage('Could not connect to contacts service. Please try again.');
    } finally {
      setIsScanningContacts(false);
    }
  };

  // Modern Native Contact Picker trigger
  const handlePickFromNativeContacts = async () => {
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const selected = await (navigator as any).contacts.select(props, { multiple: false });
        if (selected && selected[0]) {
          const picked = selected[0];
          const name = picked.name?.[0] || 'Friend';
          const rawTel = picked.tel?.[0] || '';
          setWhatsappNameInput(name);
          setWhatsappPhoneInput(rawTel);
          checkSingleContact(rawTel, name);
          return;
        }
      } catch (err) {
        console.warn('Native contact picker cancelled or failed:', err);
      }
    } else {
      setScanStatusMessage('Native Contact Picker is supported on Android Chrome/PWA. You can type any phone number or choose from quick contacts below!');
    }
  };

  // Check specific phone number to see if they play Ludo or are online
  const checkSingleContact = async (rawPhone: string, contactName?: string) => {
    const cleanDigits = rawPhone.replace(/[^0-9+]/g, '');
    if (!cleanDigits) return;

    setIsScanningContacts(true);
    setCheckedContactResult(null);

    const fullPhone = cleanDigits.startsWith('+') ? cleanDigits : `${selectedCountryCode}${cleanDigits.replace(/^0+/, '')}`;

    try {
      const res = await fetch('/api/contacts/check-device-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: [{ name: contactName || whatsappNameInput || 'Contact', tel: fullPhone }] }),
      });
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        const m = data.matches[0];
        setCheckedContactResult({
          phone: fullPhone,
          name: contactName || m.contactName,
          isRegistered: true,
          user: m.matchedUser,
          isOnline: m.isOnline,
          isPlaying: m.isPlaying,
        });
      } else {
        setCheckedContactResult({
          phone: fullPhone,
          name: contactName || whatsappNameInput || 'Friend',
          isRegistered: false,
        });
      }
    } catch {
      setCheckedContactResult({
        phone: fullPhone,
        name: contactName || whatsappNameInput || 'Friend',
        isRegistered: false,
      });
    } finally {
      setIsScanningContacts(false);
    }
  };

  // Send WhatsApp Match Invite & Host Game
  const handleTriggerWhatsAppInvite = (phone: string, name?: string) => {
    const fullPhone = phone.startsWith('+') ? phone : `${selectedCountryCode}${phone.replace(/[^0-9]/g, '').replace(/^0+/, '')}`;
    if (onSendWhatsAppInvite) {
      onSendWhatsAppInvite(fullPhone, name);
      onClose();
    } else {
      const cleanPhone = fullPhone.replace(/[^0-9]/g, '');
      const code = `CHAMP${Math.floor(1000 + Math.random() * 9000)}`;
      const inviteUrl = `${window.location.origin}/?room=${code}`;
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.ludo.arena';
      const text = `🎲 *Ludo Match Invitation!*
Hey ${name || 'Friend'}! Let's play a live 1v1 Ludo game together!

⚡ *Match Room Code:* ${code}
👉 *Tap to Join & Play Online Now:*
${inviteUrl}

📲 *Google Play Store App Link:*
${playStoreUrl}

Come online and let's play! 👑`;
      const encoded = encodeURIComponent(text);
      const url = cleanPhone.length >= 7 ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, '_blank');
      onClose();
    }
  };

  const handleAcceptContactsPermission = async () => {
    localStorage.setItem('ludo_contacts_accepted', 'true');
    setHasAcceptedContactsPermission(true);
    setIsPermissionPromptOpen(false);

    if (typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'email'];
        const selected = await (navigator as any).contacts.select(props, { multiple: true });
        if (selected && selected.length > 0) {
          syncDeviceContacts(selected, true);
          return;
        }
      } catch (err) {
        console.warn('Native contacts picker cancelled:', err);
      }
    }

    syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, true);
  };

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}`;
    const shareText = `🎲 Join me for a game of Ludo on Ludo Arena! Play online in browser or Play Store app: ${inviteUrl}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Play Ludo Multiplayer Arena',
          text: shareText,
          url: inviteUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleToggleContact = async (contactId: string) => {
    if (!currentUser || !authToken) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    try {
      const res = await fetch('/api/contacts/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ contactId }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedContactIds(data.contacts);
      }
    } catch (err) {
      console.error('Error toggling contact:', err);
    }
  };

  if (!isOpen) return null;

  const onlineUsers = usersList.filter((u) => u.isOnline && u.id !== currentUser?.id);
  const myFriends = usersList.filter(
    (u) => savedContactIds.includes(u.id) && u.id !== currentUser?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain pt-4 sm:pt-4">
      <div
        className="relative w-[calc(100vw-20px)] max-w-2xl mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="contacts-modal-panel"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>WhatsApp Contacts & Match Invites</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineUsers.length} Online Now
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Pick WhatsApp contacts, check if they play, and invite them to join your online match!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan / Status Alert Toast */}
        {scanStatusMessage && (
          <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{scanStatusMessage}</span>
            </span>
            <button
              onClick={() => setScanStatusMessage(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* Segmented Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mt-3 mb-2.5 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span className="truncate">WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('playing_contacts')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'playing_contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Playing ({matchedContacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'online'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">Online ({onlineUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span className="truncate">Friends ({myFriends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span className="truncate">All ({usersList.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 custom-scrollbar">
          
          {/* ================= TAB 1: WHATSAPP PHONE NUMBER PICKUP & INSTANT PLAY ================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              {/* Box 1: Native Phone Contact Pickup & Custom Number Form */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shrink-0">
                      💬
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>Pickup WhatsApp Phone Number</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Instant Play
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Select a contact from phone or enter their number to check if they play Ludo or invite them!
                      </p>
                    </div>
                  </div>

                  {/* 1-Tap Pick from Native Android Contacts Button */}
                  <button
                    type="button"
                    onClick={handlePickFromNativeContacts}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95 shrink-0"
                    title="Open device contact book"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pick Phone Contact</span>
                  </button>
                </div>

                {/* Phone & Country Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkSingleContact(whatsappPhoneInput, whatsappNameInput);
                  }}
                  className="space-y-2 pt-1"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    {/* Contact Name (Optional) */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={whatsappNameInput}
                        onChange={(e) => setWhatsappNameInput(e.target.value)}
                        placeholder="Friend Name (e.g. David)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Country Code Selector */}
                    <div className="sm:col-span-3">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="sm:col-span-5 flex gap-1.5">
                      <input
                        type="tel"
                        required
                        value={whatsappPhoneInput}
                        onChange={(e) => setWhatsappPhoneInput(e.target.value)}
                        placeholder="300 1234567"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isScanningContacts || !whatsappPhoneInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Check</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Checked Contact Result Card */}
                {checkedContactResult && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {checkedContactResult.user?.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs sm:text-sm">
                            {checkedContactResult.name}
                          </span>
                          {checkedContactResult.isOnline ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              Online in App
                            </span>
                          ) : checkedContactResult.isPlaying ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Playing Now
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                              {checkedContactResult.isRegistered ? 'Offline' : 'Not on App Yet'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {checkedContactResult.phone}
                          {checkedContactResult.user?.username && ` • @${checkedContactResult.user.username}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {checkedContactResult.isOnline && checkedContactResult.user ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (inviteHandler) {
                              inviteHandler(checkedContactResult.user);
                              onClose();
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Challenge Online & Play</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerWhatsAppInvite(checkedContactResult.phone, checkedContactResult.name)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Invite via WhatsApp to Play</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Quick WhatsApp Contacts to Challenge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick WhatsApp Contacts (1-Tap Invite & Play)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Send direct match challenge</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_DEVICE_CONTACTS.map((friend, idx) => (
                    <div
                      key={`quick-wa-${idx}`}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{friend.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{friend.tel}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerWhatsAppInvite(friend.tel, friend.name)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                        title="Send match room code on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Universal Match Invite Link with Play Store App */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">General Invite Link & Store App</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                    Google Play & Web Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Anyone who taps your invite link will automatically come online and join your room to play, whether on mobile browser or Android Play Store app!
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?room=CHAMPION`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CONTACTS CURRENTLY PLAYING ================= */}
          {activeTab === 'playing_contacts' && (
            <div className="space-y-2.5">
              {!hasAcceptedContactsPermission ? (
                <div className="text-center py-8 px-4 bg-slate-950/60 border border-dashed border-indigo-500/30 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">
                    Check If Someone in Your Contacts Plays Ludo
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                    Accept contact list permission to scan your phone contacts. When someone from your contacts plays Ludo or comes online, you will receive an instant notification!
                  </p>
                  <button
                    onClick={() => setIsPermissionPromptOpen(true)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Check Contact List</span>
                  </button>
                </div>
              ) : matchedContacts.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-xs">No Contacts Detected Playing Right Now</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    None of your contacts are in an active match. Pick a phone number in the WhatsApp tab to challenge them!
                  </p>
                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Contacts</span>
                  </button>
                </div>
              ) : (
                matchedContacts.map((item, idx) => {
                  const u = item.matchedUser;
                  return (
                    <div
                      key={`matched-${u.id}-${idx}`}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isPlaying
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                            {u.avatar}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                              item.isPlaying
                                ? 'bg-amber-400 animate-ping'
                                : u.isOnline
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.contactName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (@{u.username})
                            </span>
                            {item.isPlaying ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                <Play className="w-2.5 h-2.5" />
                                Playing Ludo Now
                              </span>
                            ) : u.isOnline ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Online
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-semibold">{u.eloRating} Elo</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300 text-[11px]">
                              {item.contactPhone || u.phoneNumber}
                            </span>
                            {item.currentMode && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-300 text-[11px]">
                                  In: {item.currentMode}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleTriggerWhatsAppInvite(item.contactPhone || u.phoneNumber || '', item.contactName)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Invite on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            if (inviteHandler) {
                              inviteHandler(u);
                              onClose();
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{item.isPlaying ? 'Join Room' : 'Ask to Join Match'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ================= TAB 3, 4, 5: DIRECTORY / ONLINE PLAYERS ================= */}
          {activeTab !== 'whatsapp' && activeTab !== 'playing_contacts' && (
            <>
              {/* Search Bar inside directory views */}
              <div className="relative mb-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search directory by name, phone number, or country..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading players...</span>
                </div>
              ) : (
                (activeTab === 'online'
                  ? onlineUsers
                  : activeTab === 'contacts'
                  ? myFriends
                  : usersList.filter((u) => u.id !== currentUser?.id)
                ).map((contact) => {
                  const isSaved = savedContactIds.includes(contact.id);
                  return (
                    <div
                      key={`contact-${contact.id}`}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                            {contact.avatar}
                          </div>
                          {contact.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                              {contact.username}
                            </span>
                            {contact.isOnline ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Online
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-bold text-amber-400 font-mono">
                              {contact.eloRating} Elo
                            </span>
                            <span>•</span>
                            <span className="truncate">{contact.country}</span>
                            {contact.phoneNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-300 truncate">
                                  {contact.phoneNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* WhatsApp Invite Button if phone number is present */}
                        {contact.phoneNumber && (
                          <button
                            type="button"
                            onClick={() => handleTriggerWhatsAppInvite(contact.phoneNumber || '', contact.username)}
                            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 transition cursor-pointer"
                            title="Send WhatsApp Invite"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Save Friend Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleContact(contact.id)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            isSaved
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={isSaved ? 'Remove from Friends' : 'Add to Friends'}
                        >
                          {isSaved ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>

                        {/* Challenge / Ask to Join Match Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (inviteHandler) {
                              inviteHandler(contact);
                              onClose();
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">Challenge</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Bottom Contacts Sync Permission Modal Dialog */}
        {isPermissionPromptOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-black text-white mb-2">Connect Device Contacts</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect your device contact book to check who plays Ludo. You will receive notifications when contacts come online or are in a match!
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-[11px] text-slate-300 space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Private &amp; Secure Contact Matching</span>
                </div>
                <p className="text-slate-400">
                  Phone numbers are only matched against active registered player accounts and are never sold or shared.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPermissionPromptOpen(false)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAcceptContactsPermission}
                  className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  Allow &amp; Check
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
