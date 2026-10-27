import React, { useState, useEffect } from 'react';
import { ContactUser, UserProfile, ContactMatchResult } from '../types/ludo';
import { notificationService } from '../utils/notifications';
import {
  Search,
  Phone,
  Globe,
  Users,
  Zap,
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Play,
  Copy,
  Smartphone,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Send,
  Edit2,
  CheckCircle,
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
  const [activeTab, setActiveTab] = useState<'online_contacts' | 'whatsapp' | 'device_contacts' | 'search'>('online_contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedContactIds, setSavedContactIds] = useState<string[]>(currentUser?.contacts || []);
  const [copiedLink, setCopiedLink] = useState(false);

  // User's Own Phone Number State
  const [myPhoneNumber, setMyPhoneNumber] = useState<string>(() => {
    return currentUser?.phoneNumber || localStorage.getItem('ludo_my_phone') || '';
  });
  const [myPhoneInput, setMyPhoneInput] = useState('');
  const [myPhoneCountry, setMyPhoneCountry] = useState('+92');
  const [isSettingOwnPhone, setIsSettingOwnPhone] = useState(false);
  const [isPhoneSavedToast, setIsPhoneSavedToast] = useState(false);

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
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [challengeSentTo, setChallengeSentTo] = useState<string | null>(null);

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
      if (currentUser?.phoneNumber) {
        setMyPhoneNumber(currentUser.phoneNumber);
      } else {
        const stored = localStorage.getItem('ludo_my_phone');
        if (stored) setMyPhoneNumber(stored);
      }
      if (hasAcceptedContactsPermission && matchedContacts.length === 0) {
        syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, false);
      }
    }
  }, [isOpen, searchQuery, currentUser]);

  // Save User's Own Phone Number
  const handleSaveMyPhoneNumber = async (rawPhone: string, countryCode: string) => {
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (!cleanDigits || cleanDigits.length < 5) return false;

    const fullPhone = `${countryCode} ${cleanDigits}`;
    setMyPhoneNumber(fullPhone);
    localStorage.setItem('ludo_my_phone', fullPhone);
    setIsSettingOwnPhone(false);
    setIsPhoneSavedToast(true);
    setTimeout(() => setIsPhoneSavedToast(false), 3000);

    // If authenticated, update backend user profile
    if (authToken) {
      try {
        await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ phoneNumber: fullPhone }),
        });
      } catch (err) {
        console.error('Error updating phone in profile:', err);
      }
    }

    // Mark contacts accepted and sync to immediately check online friends
    localStorage.setItem('ludo_contacts_accepted', 'true');
    setHasAcceptedContactsPermission(true);
    syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, true);
    return true;
  };

  // Synchronize contact list with backend and notify user if any contact is playing
  const syncDeviceContacts = async (
    contactsToSync: Array<{ name: string; tel?: string | string[]; email?: string | string[] }>,
    showNotificationToasts = true
  ) => {
    setIsScanningContacts(true);
    setScanStatusMessage('Checking your contacts list for online Ludo players...');

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
              `🎉 ${playingFriends.length} contact${playingFriends.length > 1 ? 's' : ''} currently playing Ludo! Tap "⚡ Send Challenge" to join.`
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
              `🟢 ${onlineFriends.length} contact${onlineFriends.length > 1 ? 's' : ''} online in Ludo now! You can send them a match challenge.`
            );
          } else {
            setScanStatusMessage(
              `Found ${data.matches.length} contacts registered in Ludo. Send them a challenge or WhatsApp invite to come online!`
            );
          }
        }
      } else {
        setScanStatusMessage(
          'No matching contacts found currently online. Pick a phone number to invite via WhatsApp!'
        );
      }
    } catch (err) {
      console.error('Error syncing device contacts:', err);
      setScanStatusMessage('Could not connect to contacts service. Please try again.');
    } finally {
      setIsScanningContacts(false);
    }
  };

  // Native Contact Picker trigger
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
        console.warn('Native contact picker cancelled:', err);
      }
    } else {
      setScanStatusMessage('Native Contact Picker is supported on Android Chrome/PWA. You can enter any number below!');
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
      const url = cleanPhone.length >= 7
        ? `https://wa.me/${cleanPhone}?text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, '_blank');
      onClose();
    }
  };

  // Direct In-App Challenge to an Online Contact
  const handleSendDirectChallenge = (targetUser: any, contactName?: string) => {
    setChallengeSentTo(contactName || targetUser.username);
    setTimeout(() => setChallengeSentTo(null), 3000);
    if (inviteHandler) {
      inviteHandler(targetUser);
      onClose();
    }
  };

  const handleAcceptContactsPermission = async (userPhoneDigits?: string) => {
    if (userPhoneDigits) {
      await handleSaveMyPhoneNumber(userPhoneDigits, myPhoneCountry);
    } else {
      localStorage.setItem('ludo_contacts_accepted', 'true');
      setHasAcceptedContactsPermission(true);
    }
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

  if (!isOpen) return null;

  // Split matched contacts into online/playing vs offline
  const onlineContacts = matchedContacts.filter((c) => c.isOnline || c.isPlaying);
  const offlineContacts = matchedContacts.filter((c) => !c.isOnline && !c.isPlaying);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain pt-3 sm:pt-4">
      <div
        className="relative w-full max-w-2xl mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="contacts-modal-panel"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 sm:gap-2">
                <span className="truncate">Contacts &amp; Online Friends</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineContacts.length} Online
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Find contacts who play Ludo and send them an instant match challenge!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge Sent Toast Notification */}
        {challengeSentTo && (
          <div className="mt-2 p-2.5 rounded-2xl bg-indigo-600/90 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn shrink-0">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Championship challenge sent to {challengeSentTo}! Creating match room...</span>
            </span>
          </div>
        )}

        {/* Scan / Status Alert Toast */}
        {scanStatusMessage && !challengeSentTo && (
          <div className="mt-2 p-2 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex items-center justify-between text-[11px] sm:text-xs text-indigo-200 shrink-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{scanStatusMessage}</span>
            </span>
            <button
              onClick={() => setScanStatusMessage(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* ================= USER'S OWN PHONE NUMBER PROMPT ================= */}
        {(!myPhoneNumber || isSettingOwnPhone) ? (
          <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/50 shadow-lg space-y-2.5 shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    <span>Enter Your Contact Number</span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      Required for Matching
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Enter your phone number so your friends can see when you are online in Ludo and challenge you to play.
                  </p>
                </div>
              </div>
              {myPhoneNumber && (
                <button
                  type="button"
                  onClick={() => setIsSettingOwnPhone(false)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveMyPhoneNumber(myPhoneInput, myPhoneCountry);
              }}
              className="flex flex-col sm:flex-row gap-2 pt-0.5"
            >
              <div className="flex gap-1.5 flex-1 min-w-0">
                <select
                  value={myPhoneCountry}
                  onChange={(e) => setMyPhoneCountry(e.target.value)}
                  className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono shrink-0"
                >
                  {COUNTRY_DIAL_CODES.map((c) => (
                    <option key={`my-country-${c.code}`} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  value={myPhoneInput}
                  onChange={(e) => setMyPhoneInput(e.target.value)}
                  placeholder="300 1234567"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={!myPhoneInput.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save &amp; Check Online Friends</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-slate-400 shrink-0">Your Number:</span>
              <span className="font-mono font-bold text-white truncate text-[11px] sm:text-xs">{myPhoneNumber}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                Online in Ludo
              </span>
            </div>

            <button
              onClick={() => {
                setMyPhoneInput(myPhoneNumber.replace(/[^0-9]/g, ''));
                setIsSettingOwnPhone(true);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold ml-2 shrink-0 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mt-2.5 mb-2 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('online_contacts')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === 'online_contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Online ({onlineContacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('device_contacts')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === 'device_contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Contacts ({matchedContacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`py-1.5 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3 shrink-0" />
            <span className="truncate">Directory</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 custom-scrollbar min-w-0">
          
          {/* ================= TAB 1: ONLINE CONTACTS & INSTANT CHALLENGE ================= */}
          {activeTab === 'online_contacts' && (
            <div className="space-y-3">
              {/* Permission Banner if not enabled yet */}
              {!hasAcceptedContactsPermission && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-7 h-7 text-indigo-400 shrink-0" />
                    <div className="text-left">
                      <h4 className="font-bold text-xs sm:text-sm text-white">Connect Device Contacts</h4>
                      <p className="text-[11px] text-slate-300">
                        Check which friends in your phone address book are online in Ludo right now!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPermissionPromptOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer shrink-0 active:scale-95"
                  >
                    Allow &amp; Check Online
                  </button>
                </div>
              )}

              {/* Online Friends List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Friends Online in Ludo Now</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {onlineContacts.length} available to challenge
                  </span>
                </div>

                {onlineContacts.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-xl">
                      📭
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">No Contacts Online Right Now</h4>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                        Send a WhatsApp invite to your friends so they can come online and join your match!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('whatsapp')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Invites to Contacts</span>
                    </button>
                  </div>
                ) : (
                  onlineContacts.map((item, idx) => {
                    const u = item.matchedUser;
                    return (
                      <div
                        key={`online-contact-${u.id}-${idx}`}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-2 border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-emerald-500/80"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-2xl bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center text-2xl shadow-inner">
                              {u.avatar}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-400 animate-pulse" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm text-white truncate">{item.contactName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                              {item.isPlaying ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                  <Play className="w-2.5 h-2.5" />
                                  In Match
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Online Ready
                                </span>
                              )}
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
                                  <span className="text-indigo-300 text-[11px]">{item.currentMode}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Send Challenge Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTriggerWhatsAppInvite(item.contactPhone || u.phoneNumber || '', item.contactName)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-bold text-white shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Send WhatsApp Match Notification"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendDirectChallenge(u, item.contactName)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            <span>{item.isPlaying ? 'Join Match' : '⚡ Send Challenge'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick WhatsApp Invite to Offline Contacts */}
              {offlineContacts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-400">Offline Contacts (Invite to Play)</span>
                    <span className="text-[10px] text-slate-500">{offlineContacts.length} contacts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {offlineContacts.map((item, idx) => (
                      <div
                        key={`offline-${idx}`}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">{item.contactName}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {item.contactPhone || item.matchedUser.phoneNumber}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTriggerWhatsAppInvite(item.contactPhone || item.matchedUser.phoneNumber || '', item.contactName)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>Invite</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: WHATSAPP PHONE NUMBER PICKUP & PLAY ================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              {/* Box 1: Custom Phone Number Check */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shrink-0">
                      💬
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
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
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={whatsappNameInput}
                        onChange={(e) => setWhatsappNameInput(e.target.value)}
                        placeholder="Friend Name (e.g. David)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

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

                    <div className="sm:col-span-5 flex gap-1.5">
                      <input
                        type="tel"
                        required
                        value={whatsappPhoneInput}
                        onChange={(e) => setWhatsappPhoneInput(e.target.value)}
                        placeholder="300 1234567"
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {checkedContactResult.user?.avatar || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                            {checkedContactResult.name}
                          </span>
                          {checkedContactResult.isOnline ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              Online Now
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
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          {checkedContactResult.phone}
                          {checkedContactResult.user?.username && ` • @${checkedContactResult.user.username}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {checkedContactResult.isOnline && checkedContactResult.user ? (
                        <button
                          type="button"
                          onClick={() => handleSendDirectChallenge(checkedContactResult.user, checkedContactResult.name)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ Send Challenge</span>
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

              {/* Universal Shareable Match Invite Link */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">General Invite Link (Play Store &amp; Web)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-mono">
                    Google Play Ready
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
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ALL DEVICE CONTACTS ================= */}
          {activeTab === 'device_contacts' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-300">
                  Synced Address Book Contacts ({matchedContacts.length})
                </span>
                <button
                  onClick={() => syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, true)}
                  disabled={isScanningContacts}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  {isScanningContacts ? 'Scanning...' : '🔄 Re-scan'}
                </button>
              </div>

              {matchedContacts.map((item, idx) => {
                const u = item.matchedUser;
                return (
                  <div
                    key={`all-matched-${u.id}-${idx}`}
                    className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.isOnline
                        ? 'bg-slate-950 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {u.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white truncate">{item.contactName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                          {item.isOnline && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Online
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          {item.contactPhone || u.phoneNumber} • {u.eloRating} Elo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTriggerWhatsAppInvite(item.contactPhone || u.phoneNumber || '', item.contactName)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow transition flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {item.isOnline && (
                        <button
                          type="button"
                          onClick={() => handleSendDirectChallenge(u, item.contactName)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Challenge</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= TAB 4: GLOBAL SEARCH & DIRECTORY ================= */}
          {activeTab === 'search' && (
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player username, country, or Elo..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {isLoading ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading players...</div>
              ) : (
                usersList.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {contact.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white truncate">{contact.username}</span>
                          {contact.isOnline ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {contact.stats.eloRating} Elo • {contact.country || 'Global'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendDirectChallenge(contact)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Challenge</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ================= PERMISSION & PHONE NUMBER MODAL DIALOG ================= */}
        {isPermissionPromptOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-white mb-1.5">Connect Contacts &amp; Check Online</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Enter your mobile number and allow contact matching to see which of your friends are currently online in Ludo and challenge them to play!
              </p>

              {/* User Phone Number Input inside Permission Dialog */}
              <div className="mb-4 text-left">
                <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                  Your WhatsApp / Contact Number:
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={myPhoneCountry}
                    onChange={(e) => setMyPhoneCountry(e.target.value)}
                    className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono shrink-0"
                  >
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <option key={`prompt-${c.code}`} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={myPhoneInput}
                    onChange={(e) => setMyPhoneInput(e.target.value)}
                    placeholder="300 1234567"
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-[11px] text-slate-300 space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Private &amp; Secure Contact Matching</span>
                </div>
                <p className="text-slate-400 text-[10px]">
                  Phone numbers are only matched to find active players and are never shared or sold.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPermissionPromptOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAcceptContactsPermission(myPhoneInput)}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Allow &amp; Check</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
