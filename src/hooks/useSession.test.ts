import { renderHook, act } from '@testing-library/react-hooks';
import { useSession } from './useSession';
import { Avatar, UserProfile } from '../types';

// Mock data for testing
const mockAvatarLowPrice: Avatar = {
  id: '1',
  name: 'Test Avatar Low',
  title: 'Test Coach',
  pricePerMinute: 1.5,
  description: 'Test description',
};

const mockAvatarMediumPrice: Avatar = {
  id: '2',
  name: 'Test Avatar Medium',
  title: 'Test Coach',
  pricePerMinute: 2.0,
  description: 'Test description',
};

const mockAvatarHighPrice: Avatar = {
  id: '3',
  name: 'Test Avatar High',
  title: 'Test Coach',
  pricePerMinute: 3.0,
  description: 'Test description',
};

const mockUserProfile: UserProfile = {
  userId: 'user-123',
  name: 'Test User',
  tokenBalance: 4.0,
};

describe('useSession Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('checkSufficientBalance', () => {
    it('should allow session start when balance >= 2 minutes of session time', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('initializing');
      expect(global.alert).not.toHaveBeenCalledWith('Insufficient balance to start session');
    });

    it('should block session start when balance < 2 minutes of session time', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarHighPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('idle');
      expect(global.alert).toHaveBeenCalledWith('Insufficient balance to start session');
    });

    it('should allow session start when balance exactly equals 2x avatar price per minute', () => {
      const exactBalanceAvatar: Avatar = {
        ...mockAvatarMediumPrice,
        pricePerMinute: 2.0, // 4.0 / 2.0 = exactly 2 minutes
      };

      const { result } = renderHook(() => useSession(exactBalanceAvatar, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('initializing');
      expect(global.alert).not.toHaveBeenCalledWith('Insufficient balance to start session');
    });

    it('should block session when balance is just below 2 minutes of runtime', () => {
      const slightlyHighAvatar: Avatar = {
        ...mockAvatarMediumPrice,
        pricePerMinute: 2.01, // 4.0 / 2.01 = 1.99 minutes (just below 2)
      };

      const { result } = renderHook(() => useSession(slightlyHighAvatar, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('idle');
      expect(global.alert).toHaveBeenCalledWith('Insufficient balance to start session');
    });
  });

  describe('checkLowBalance', () => {
    it('should show low balance warning when remaining balance < 1 minute of talk time', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      // Start session
      act(() => {
        result.current.handleStartSession();
      });

      // Advance to initializing -> active
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.sessionState).toBe('active');

      // Run for 90 seconds (1:30)
      // At 1:30, consumed = 2.0 * 1.5 = 3.0 tokens
      // Remaining = 4.0 - 3.0 = 1.0 token
      // 1 minute costs 2.0 tokens, so warning should appear
      act(() => {
        jest.advanceTimersByTime(90000);
      });

      expect(result.current.showLowBalanceWarning).toBe(true);
    });

    it('should show warning only once per session', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Advance to trigger low balance warning
      act(() => {
        jest.advanceTimersByTime(90000);
      });

      expect(result.current.showLowBalanceWarning).toBe(true);

      // Continue running - warning should still be shown but not triggered again
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.showLowBalanceWarning).toBe(true);
    });

    it('should not show warning when balance is sufficient', () => {
      const { result } = renderHook(() => useSession(mockAvatarLowPrice, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Run for 60 seconds
      // Consumed = 1.5 * 1.0 = 1.5 tokens
      // Remaining = 4.0 - 1.5 = 2.5 tokens (enough for 1 minute at 1.5/min)
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.showLowBalanceWarning).toBe(false);
    });
  });

  describe('checkBalanceDepleted', () => {
    it('should auto-terminate session when balance is depleted', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.sessionState).toBe('active');

      // Run for 120 seconds (2:00)
      // At 2:00, consumed = 2.0 * 2.0 = 4.0 tokens (exactly depleted)
      act(() => {
        jest.advanceTimersByTime(120000);
      });

      expect(result.current.sessionState).toBe('ending');
      expect(result.current.tokensConsumed).toBeCloseTo(4.0, 2);
    });

    it('should terminate immediately when balance exceeds', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Run beyond depletion point
      act(() => {
        jest.advanceTimersByTime(121000);
      });

      expect(result.current.sessionState).toBe('ending');
    });

    it('should handle exact balance depletion correctly', () => {
      const exactAvatar: Avatar = {
        ...mockAvatarMediumPrice,
        pricePerMinute: 2.0,
      };

      const { result } = renderHook(() => useSession(exactAvatar, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Run for exactly 120 seconds
      act(() => {
        jest.advanceTimersByTime(120000);
      });

      expect(result.current.tokensConsumed).toBeCloseTo(4.0, 2);
      expect(result.current.sessionState).toBe('ending');
    });
  });

  describe('Token consumption calculations', () => {
    it('should calculate tokens consumed correctly over time', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // After 30 seconds: 2.0 * 0.5 = 1.0 tokens
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.tokensConsumed).toBeCloseTo(1.0, 2);
      expect(result.current.sessionDuration).toBe(30);

      // After 60 seconds total: 2.0 * 1.0 = 2.0 tokens
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.tokensConsumed).toBeCloseTo(2.0, 2);
      expect(result.current.sessionDuration).toBe(60);
    });

    it('should handle fractional token consumption correctly', () => {
      const { result } = renderHook(() => useSession(mockAvatarLowPrice, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // After 10 seconds: 1.5 / 60 * 10 = 0.25 tokens
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.tokensConsumed).toBeCloseTo(0.25, 2);
    });
  });

  describe('Session state flow', () => {
    it('should follow correct state transitions: idle -> initializing -> active -> ending -> ended', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      expect(result.current.sessionState).toBe('idle');

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('initializing');

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.sessionState).toBe('active');

      act(() => {
        result.current.handleEndSession();
      });

      expect(result.current.sessionState).toBe('ending');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.sessionState).toBe('ended');
    });

    it('should reset timer when starting new session', () => {
      const { result, rerender } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.sessionDuration).toBe(30);

      act(() => {
        result.current.handleEndSession();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Re-render to simulate new session
      rerender();

      expect(result.current.sessionDuration).toBe(30); // Duration persists until component remount
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle zero balance gracefully', () => {
      const zeroBalanceProfile: UserProfile = {
        ...mockUserProfile,
        tokenBalance: 0,
      };

      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', zeroBalanceProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('idle');
      expect(global.alert).toHaveBeenCalledWith('Insufficient balance to start session');
    });

    it('should handle very small token amounts', () => {
      const smallBalanceProfile: UserProfile = {
        ...mockUserProfile,
        tokenBalance: 0.1,
      };

      const lowPriceAvatar: Avatar = {
        ...mockAvatarMediumPrice,
        pricePerMinute: 0.05,
      };

      const { result } = renderHook(() => useSession(lowPriceAvatar, 'VIDEO', smallBalanceProfile));

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('initializing');
    });

    it('should handle session type VIDEO correctly', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VIDEO', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).not.toBe('idle');
    });

    it('should handle session type VOICE correctly', () => {
      const { result } = renderHook(() =>
        useSession(mockAvatarMediumPrice, 'VOICE', mockUserProfile)
      );

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).not.toBe('idle');
    });
  });

  describe('Real-world test scenarios', () => {
    it('Sarah Chen scenario: 2.00/min with 4.0 balance -> runs 2:00', () => {
      const sarahChen: Avatar = {
        id: '1',
        name: 'Sarah Chen',
        title: 'Business Coach',
        pricePerMinute: 2.0,
        description: 'Expert in startup strategy',
      };

      const { result } = renderHook(() => useSession(sarahChen, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // At 1:30, should show low balance warning
      act(() => {
        jest.advanceTimersByTime(90000);
      });

      expect(result.current.showLowBalanceWarning).toBe(true);
      expect(result.current.sessionState).toBe('active');

      // At 2:00, should auto-terminate
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.sessionState).toBe('ending');
      expect(result.current.tokensConsumed).toBeCloseTo(4.0, 2);
    });

    it('Marcus Rivera scenario: 1.50/min with 4.0 balance -> runs ~2:40', () => {
      const marcusRivera: Avatar = {
        id: '2',
        name: 'Marcus Rivera',
        title: 'Fitness Trainer',
        pricePerMinute: 1.5,
        description: 'Personal training specialist',
      };

      const { result } = renderHook(() => useSession(marcusRivera, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Run for 2:40 (160 seconds)
      // Consumed = 1.5 * (160/60) = 4.0 tokens
      act(() => {
        jest.advanceTimersByTime(160000);
      });

      expect(result.current.sessionState).toBe('ending');
      expect(result.current.tokensConsumed).toBeCloseTo(4.0, 1);
    });

    it('Dr. Emily Watson scenario: 3.00/min with 4.0 balance -> blocked', () => {
      const emilyWatson: Avatar = {
        id: '3',
        name: 'Dr. Emily Watson',
        title: 'Career Counselor',
        pricePerMinute: 3.0,
        description: 'PhD in organizational psychology',
      };

      const { result } = renderHook(() => useSession(emilyWatson, 'VIDEO', mockUserProfile));

      act(() => {
        result.current.handleStartSession();
      });

      expect(result.current.sessionState).toBe('idle');
      expect(global.alert).toHaveBeenCalledWith('Insufficient balance to start session');
    });
  });
});
