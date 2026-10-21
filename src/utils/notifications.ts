export class NotificationManager {
  private static instance: NotificationManager;
  private hasPermission: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      this.hasPermission = perm === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public sendTurnNotification(playerName: string, isMyTurn: boolean) {
    if (!isMyTurn) return;

    // If tab is in background and notification permitted
    if (typeof document !== 'undefined' && document.hidden && this.hasPermission && 'Notification' in window) {
      try {
        new Notification('🎲 Your Turn in Ludo!', {
          body: `${playerName}, roll the dice now! Your turn has started.`,
          icon: '/favicon.ico',
          tag: 'ludo-turn-reminder',
        });
      } catch {
        // Fallback gracefully
      }
    }
  }

  public sendContactOnlineNotification(contactName: string, country?: string, phoneNumber?: string) {
    if (this.hasPermission && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(`🟢 ${contactName} is Online!`, {
          body: `${contactName} ${country ? `(${country})` : ''} is now active in Ludo. Challenge them to a match!`,
          icon: '/favicon.ico',
          tag: `contact-online-${contactName}`,
        });
      } catch {
        // Fallback
      }
    }
  }

  public sendContactPlayingNotification(contactName: string, gameMode?: string, roomCode?: string) {
    if (this.hasPermission && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(`🎲 ${contactName} is Playing Ludo!`, {
          body: `${contactName} is currently playing ${gameMode || 'a match'}${roomCode ? ` (Room ${roomCode})` : ''}. Tap to challenge or join!`,
          icon: '/favicon.ico',
          tag: `contact-playing-${contactName}`,
        });
      } catch {
        // Fallback
      }
    }
  }
}

export const notificationService = NotificationManager.getInstance();
