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
}

// Sample device address book contacts for simulation/demo if Web Contacts API is not natively available
const DEFAULT_DEVICE_CONTACTS = [
  { name: 'David Miller (Best Friend)', tel: '+1 (555) 234-5678', email: 'david@example.com' },
  { name: 'Sarah Connor (Sister)', tel: '+44 7700 900123', email: 'sarah@example.com' },
  { name: 'Raj Patel (Colleague)', tel: '+91 98765 43210', email: 'raj@example.com' },
  { name: 'Alex Smith (Gym Buddy)', tel: '+1 (416) 555-0199', email: 'alex@example.com' },
  { name: 'Samira Khan (Cousin)', tel: '+971 50 123 4567', email: 'samira@example.com' },
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
}) => {
  const [activeTab, setActiveTab] = useState<'playing_contacts' | 'online' | 'contacts' | 'search'>('playing_contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<ContactUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedContactIds, setSavedContactIds] = useState<string[]>(currentUser?.contacts || []);
  const [copiedLink, setCopiedLink] = useState(false);

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
      // If user previously accepted contacts sync, re-verify status to notify if any friend is playing
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
        setActiveTab('playing_contacts');

        // Check if any matched contact is actively playing or online
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

            // Send system push / browser notification
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
              `Found ${data.matches.length} contacts registered in Ludo. They are currently offline, but you will be notified when they play!`
            );
          }
        }
      } else {
        setScanStatusMessage(
          'No matching contacts found currently playing. Invite them using your invitation link below!'
        );
      }
    } catch (err) {
      console.error('Error syncing device contacts:', err);
      setScanStatusMessage('Could not connect to contacts service. Please try again.');
    } finally {
      setIsScanningContacts(false);
    }
  };

  // Handler when user accepts the permission dialog
  const handleAcceptContactsPermission = async () => {
    localStorage.setItem('ludo_contacts_accepted', 'true');
    setHasAcceptedContactsPermission(true);
    setIsPermissionPromptOpen(false);

    // Try modern Web Contacts Picker API if available on mobile Chrome/PWA
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'email'];
        const selected = await (navigator as any).contacts.select(props, { multiple: true });
        if (selected && selected.length > 0) {
          syncDeviceContacts(selected, true);
          return;
        }
      } catch (err) {
        console.warn('Native contacts picker cancelled or unavailable:', err);
      }
    }

    // Default to device contact sync list
    syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, true);
  };

  // Handler to add custom phone number / friend to check
  const handleAddCustomContactCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhoneInput.trim()) return;

    const newContact = {
      name: customNameInput.trim() || 'My Contact',
      tel: customPhoneInput.trim(),
    };

    syncDeviceContacts([newContact, ...DEFAULT_DEVICE_CONTACTS], true);
    setCustomPhoneInput('');
    setCustomNameInput('');
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

  const handleCopyInviteLink = async () => {
    const inviteUrl = window.location.origin;
    const shareText = `🎲 Join me for a game of Ludo King on Ludo Arena! Play online here: ${inviteUrl}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Play Ludo Multiplayer Arena',
          text: shareText,
          url: inviteUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  // Filter users according to active tab
  const onlineUsers = usersList.filter((u) => u.isOnline && u.id !== currentUser?.id);
  const myFriends = usersList.filter(
    (u) => savedContactIds.includes(u.id) && u.id !== currentUser?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="contacts-modal-panel"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Player Contacts & Friends</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineUsers.length} Online Now
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Check if someone in your contacts plays Ludo, get notified when they play, and challenge them!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Contacts Access Banner & Scan Section */}
        <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/30 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Device Contacts Play Checker</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">
                    Active Notifier
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  {hasAcceptedContactsPermission
                    ? 'Contacts connected. Automatically checks registered players and notifies you when contacts are playing.'
                    : 'Get contact list and check if someone in your contacts plays Ludo King to notify you.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {hasAcceptedContactsPermission ? (
                <button
                  type="button"
                  onClick={() => syncDeviceContacts(DEFAULT_DEVICE_CONTACTS, true)}
                  disabled={isScanningContacts}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{isScanningContacts ? 'Scanning...' : 'Check Contacts Now'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPermissionPromptOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Connect & Check Contacts</span>
                </button>
              )}
            </div>
          </div>

          {/* Scan feedback status */}
          {scanStatusMessage && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-200">
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
        </div>

        {/* Search Bar Input */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory by name, phone number, country or location..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('playing_contacts')}
            className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'playing_contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Contacts Playing ({matchedContacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
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
            className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span className="truncate">Saved ({myFriends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1 custom-scrollbar">
          {/* TAB 1: Matched Device Contacts Playing Ludo */}
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
                  <h4 className="font-bold text-white text-xs">No Contacts Detected Playing Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-3">
                    None of your contacts are currently active. Click &quot;Check Contacts Now&quot; to re-scan, or check a specific friend&apos;s phone number below.
                  </p>

                  {/* Add manual phone number verification */}
                  <form onSubmit={handleAddCustomContactCheck} className="flex gap-2 max-w-md mx-auto mb-3">
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      placeholder="Contact Name"
                      className="w-1/3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="tel"
                      required
                      value={customPhoneInput}
                      onChange={(e) => setCustomPhoneInput(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                    >
                      Check
                    </button>
                  </form>
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

          {/* TAB 2, 3, 4: Standard User Views */}
          {activeTab !== 'playing_contacts' && (
            <>
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
                      key={contact.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                            {contact.avatar}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                              contact.isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{contact.username}</span>
                            {contact.isOnline && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Online
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              {contact.eloRating} Elo
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                            {contact.country && <span>{contact.country}</span>}
                            {contact.phoneNumber && (
                              <span className="font-mono text-slate-300 text-[11px]">
                                {contact.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleContact(contact.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isSaved
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSaved ? <UserCheck className="w-3 h-3 text-emerald-400" /> : <UserPlus className="w-3 h-3" />}
                          <span>{isSaved ? 'Saved' : 'Add'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (inviteHandler) {
                              inviteHandler(contact);
                              onClose();
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Challenge</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Bottom Invite Link Bar */}
        <div className="pt-3 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="font-semibold text-slate-300">Invite Friends by Link:</span> Share room
            code or invite via WhatsApp / SMS
          </div>

          <button
            onClick={handleCopyInviteLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy App Invite Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Permission Consent Modal (Right to Consent / Contacts Access) */}
      {isPermissionPromptOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white mb-2">
              Sync Contacts to Check Playing Friends?
            </h3>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              If you accept, Ludo King/Arena will securely check your contact list phone numbers and emails to see if anyone in your contacts plays Ludo. When a contact is playing or goes online, we will notify you so you can challenge them!
            </p>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant notifications when someone in contacts plays</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1-click Challenge and multiplayer room joining</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Strict privacy: Contact data is never sold or shared</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPermissionPromptOpen(false)}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Not Now
              </button>
              <button
                onClick={handleAcceptContactsPermission}
                id="btn-confirm-accept-contacts"
                className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition cursor-pointer active:scale-95"
              >
                Accept & Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
