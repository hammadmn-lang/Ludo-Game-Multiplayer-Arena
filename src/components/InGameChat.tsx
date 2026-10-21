import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PlayerColor } from '../types/ludo';
import { QUICK_EMOJIS, QUICK_PHRASES, COLOR_PALETTE } from '../utils/ludoConstants';
import {
  MessageSquare,
  Send,
  X,
  VolumeX,
  Volume2,
  UserX,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Pause,
  Play,
  UserCheck,
} from 'lucide-react';

interface InGameChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isEmoji?: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  currentUserColor?: PlayerColor;
  currentUserId?: string;
  mutedUsers?: string[];
  blockedUsers?: string[];
  isChatStopped?: boolean;
  onToggleStopChat?: () => void;
  onToggleMute?: (userId: string) => void;
  onToggleBlock?: (userId: string) => void;
}

export const InGameChat: React.FC<InGameChatProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onToggle,
  currentUserColor = 'red',
  currentUserId,
  mutedUsers = [],
  blockedUsers = [],
  isChatStopped = false,
  onToggleStopChat,
  onToggleMute,
  onToggleBlock,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeModerationId, setActiveModerationId] = useState<string | null>(null);
  const [showBlockedList, setShowBlockedList] = useState(false);
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out messages from blocked and muted users
  const visibleMessages = messages.filter((msg) => {
    if (msg.senderId && blockedUsers.includes(msg.senderId)) return false;
    if (msg.senderId && mutedUsers.includes(msg.senderId)) return false;
    return true;
  });

  useEffect(() => {
    if (isOpen && !isChatStopped) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleMessages.length, isOpen, isChatStopped]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isChatStopped || !inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleEmojiClick = (emoji: string) => {
    if (isChatStopped) return;
    onSendMessage(emoji, true);
  };

  const handlePhraseClick = (phrase: string) => {
    if (isChatStopped) return;
    onSendMessage(phrase, false);
  };

  const handleBlockUserAction = (senderId: string, senderName: string) => {
    if (onToggleBlock) {
      onToggleBlock(senderId);
      const isAlreadyBlocked = blockedUsers.includes(senderId);
      setModerationNotice(
        isAlreadyBlocked
          ? `Unblocked ${senderName}. Messages will now be visible.`
          : `Blocked ${senderName} from chat. Messages and reactions are now hidden.`
      );
      setTimeout(() => setModerationNotice(null), 3500);
      setActiveModerationId(null);
    }
  };

  const handleMuteUserAction = (senderId: string, senderName: string) => {
    if (onToggleMute) {
      onToggleMute(senderId);
      const isAlreadyMuted = mutedUsers.includes(senderId);
      setModerationNotice(
        isAlreadyMuted ? `Unmuted ${senderName}.` : `Muted ${senderName} for this match.`
      );
      setTimeout(() => setModerationNotice(null), 3500);
      setActiveModerationId(null);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button (if closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          id="btn-open-chat"
          className={`fixed bottom-4 right-4 z-40 p-3.5 rounded-2xl text-white font-bold shadow-2xl flex items-center gap-2 border transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
            isChatStopped
              ? 'bg-slate-800 border-slate-700 text-slate-400'
              : 'bg-indigo-600 hover:bg-indigo-500 border-slate-700'
          }`}
          title={isChatStopped ? 'Chat Stopped (Click to Open / Resume)' : 'Open In-Game Chat'}
        >
          {isChatStopped ? (
            <VolumeX className="w-5 h-5 text-amber-400" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
          <span className="text-xs hidden sm:inline font-bold">
            {isChatStopped ? 'Chat Paused' : 'Chat'}
          </span>
          {!isChatStopped && visibleMessages.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>
      )}

      {/* Chat Drawer / Overlay */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-[370px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur"
          id="in-game-chat-panel"
        >
          {/* Header with Title & Action Controls */}
          <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate">Match Chat</h3>
              </div>
              {isChatStopped ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                  Chat Stopped
                </span>
              ) : (
                (mutedUsers.length > 0 || blockedUsers.length > 0) && (
                  <button
                    onClick={() => setShowBlockedList(!showBlockedList)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold border border-rose-500/30 shrink-0 transition"
                    title="Manage blocked users"
                  >
                    {blockedUsers.length} Blocked
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Stop / Resume Chat Toggle Button */}
              {onToggleStopChat && (
                <button
                  type="button"
                  onClick={onToggleStopChat}
                  id="btn-toggle-stop-chat"
                  className={`px-2 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    isChatStopped
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                  title={isChatStopped ? 'Resume Live Chat' : 'Stop all chat messages'}
                >
                  {isChatStopped ? (
                    <>
                      <Play className="w-2.5 h-2.5" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-2.5 h-2.5" />
                      <span>Stop Chat</span>
                    </>
                  )}
                </button>
              )}

              {/* Blocked Users Filter Modal Button */}
              <button
                type="button"
                onClick={() => setShowBlockedList(!showBlockedList)}
                className={`p-1.5 rounded-xl transition ${
                  showBlockedList
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="View and manage blocked users"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={onToggle}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Moderation Toast Alert */}
          {moderationNotice && (
            <div className="px-3 py-1.5 bg-indigo-950 border-b border-indigo-800 text-[11px] text-indigo-200 flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{moderationNotice}</span>
              </span>
              <button
                onClick={() => setModerationNotice(null)}
                className="text-indigo-400 hover:text-white ml-2 text-xs"
              >
                ×
              </button>
            </div>
          )}

          {/* Blocked Users Sheet */}
          {showBlockedList ? (
            <div className="flex-1 p-4 bg-slate-950 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-xs text-white">Blocked Users from Chat</h4>
                </div>
                <button
                  onClick={() => setShowBlockedList(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back to Chat
                </button>
              </div>

              {blockedUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400">No users blocked</p>
                  <p className="text-[10px] mt-1 text-slate-500">
                    You can block any player from chat by clicking the shield icon next to their message.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400">
                    Blocked players cannot send you messages or reactions. Click unblock to restore:
                  </p>
                  {blockedUsers.map((blockedId) => (
                    <div
                      key={blockedId}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                          <UserX className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {blockedId}
                        </span>
                      </div>
                      {onToggleBlock && (
                        <button
                          onClick={() => handleBlockUserAction(blockedId, blockedId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isChatStopped ? (
            /* Stopped Chat Banner View */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950/70">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
                <VolumeX className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">In-Game Chat is Stopped</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
                You have turned off chat messages and reaction popups for this game. You can resume anytime to send and view chat.
              </p>
              {onToggleStopChat && (
                <button
                  onClick={onToggleStopChat}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Play className="w-3 h-3" />
                  <span>Resume Match Chat</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Quick Reaction Emojis Ribbon */}
              <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={`chat-emoji-${emoji}`}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-base p-1 hover:scale-125 transition-transform shrink-0"
                    title={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {visibleMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-1">
                    <span>💬</span>
                    <p>Say hello or send a reaction!</p>
                    <p className="text-[10px] text-slate-600">
                      Messages from blocked users are hidden. You can stop chat at any time.
                    </p>
                  </div>
                ) : (
                  visibleMessages.map((msg) => {
                    const palette = msg.senderColor ? COLOR_PALETTE[msg.senderColor] : null;
                    const isSelf = msg.senderId === currentUserId;
                    const senderId = msg.senderId || msg.senderName;
                    const isModerating = activeModerationId === msg.id;
                    const isSenderBlocked = blockedUsers.includes(senderId);
                    const isSenderMuted = mutedUsers.includes(senderId);

                    return (
                      <div
                        key={`msg-${msg.id}`}
                        className={`flex flex-col rounded-2xl p-2.5 max-w-[88%] ${
                          msg.isEmoji
                            ? 'bg-transparent text-2xl self-start py-0.5'
                            : isSelf
                            ? 'bg-indigo-600/20 border border-indigo-500/40 self-end text-right'
                            : 'bg-slate-800/80 border border-slate-700/60 self-start'
                        }`}
                      >
                        {!msg.isEmoji && (
                          <div className="flex items-center gap-1.5 mb-1">
                            {palette && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: palette.primary }}
                              />
                            )}
                            <span
                              className="font-bold text-[11px] truncate"
                              style={{ color: palette?.primary || '#818cf8' }}
                            >
                              {msg.senderName}
                            </span>

                            {!isSelf && (onToggleMute || onToggleBlock) && (
                              <button
                                type="button"
                                onClick={() => setActiveModerationId(isModerating ? null : msg.id)}
                                className={`text-[10px] ml-1 p-0.5 rounded transition ${
                                  isModerating
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                                }`}
                                title="Block or mute user from chat"
                              >
                                <Shield className="w-3 h-3" />
                              </button>
                            )}

                            <span className="text-[9px] text-slate-500 ml-auto">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Quick Mute / Block popup banner */}
                        {isModerating && !isSelf && (
                          <div className="flex items-center justify-between gap-1 p-1.5 my-1.5 rounded-xl bg-slate-950 border border-slate-700 text-[10px] animate-fadeIn">
                            <span className="text-slate-400 truncate font-mono text-[9px]">
                              User Options:
                            </span>
                            <div className="flex items-center gap-1">
                              {onToggleMute && (
                                <button
                                  type="button"
                                  onClick={() => handleMuteUserAction(senderId, msg.senderName)}
                                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 font-bold"
                                  title="Mute user messages"
                                >
                                  <VolumeX className="w-2.5 h-2.5" />
                                  {isSenderMuted ? 'Unmute' : 'Mute'}
                                </button>
                              )}
                              {onToggleBlock && (
                                <button
                                  type="button"
                                  onClick={() => handleBlockUserAction(senderId, msg.senderName)}
                                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 flex items-center gap-1 font-bold"
                                  title="Block user from chat"
                                >
                                  <UserX className="w-2.5 h-2.5" />
                                  {isSenderBlocked ? 'Unblock' : 'Block User'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-slate-200 break-words">{msg.text}</div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Phrases */}
              <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_PHRASES.map((phrase) => (
                  <button
                    key={`phrase-${phrase}`}
                    onClick={() => handlePhraseClick(phrase)}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] whitespace-nowrap transition border border-slate-700 shrink-0 cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form
                onSubmit={handleSend}
                className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  maxLength={100}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
