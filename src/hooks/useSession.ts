import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, SessionType, SessionState, UserProfile } from '../types';

// Constants for better maintainability
const SECONDS_PER_MINUTE = 60;
const TIMER_INTERVAL_MS = 1000;
const CONNECTION_DELAY_MS = 1500;
const SESSION_END_DELAY_MS = 500;
const MINIMUM_SESSION_DURATION_MINUTES = 2; // Requires 2 minutes minimum for meaningful session

/**
 * Custom hook for managing avatar session state and token billing
 *
 * @param avatar - The avatar being used in the session
 * @param sessionType - Type of session (VIDEO or VOICE)
 * @param userProfile - User profile containing token balance
 * @returns Session state and control functions
 */
export function useSession(
  avatar: Avatar,
  sessionType: SessionType,
  userProfile: UserProfile
) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [sessionDuration, setSessionDuration] = useState(0); // seconds
  const [tokensConsumed, setTokensConsumed] = useState(0);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);
  const lowBalanceWarningShown = useRef(false);

  /**
   * Calculates tokens consumed based on session duration
   * Formula: (pricePerMinute / 60) * durationInSeconds
   *
   * @param durationSeconds - Total session duration in seconds
   * @returns Total tokens consumed for the duration
   */
  const calculateTokensConsumed = useCallback(
    (durationSeconds: number): number => {
      const durationMinutes = durationSeconds / SECONDS_PER_MINUTE;
      return avatar.pricePerMinute * durationMinutes;
    },
    [avatar.pricePerMinute]
  );

  /**
   * Checks if user has sufficient balance to start a session
   * Requires at least 2 minutes worth of tokens (minimum session duration)
   * This ensures users can have a meaningful session experience
   *
   * @returns true if balance >= 2x avatar's price per minute, false otherwise
   */
  const checkSufficientBalance = useCallback((): boolean => {
    const tokensNeededForMinimumDuration =
      avatar.pricePerMinute * MINIMUM_SESSION_DURATION_MINUTES;
    return userProfile.tokenBalance >= tokensNeededForMinimumDuration;
  }, [avatar.pricePerMinute, userProfile.tokenBalance]);

  /**
   * Checks if balance is getting low and triggers warning
   * Warning appears when remaining balance < 1 minute of talk time
   * Uses ref to ensure warning is only shown once per session
   */
  const checkLowBalance = useCallback(() => {
    const remainingBalance = userProfile.tokenBalance - tokensConsumed;
    const tokensNeededForOneMinute = avatar.pricePerMinute;

    if (
      remainingBalance < tokensNeededForOneMinute &&
      !lowBalanceWarningShown.current
    ) {
      lowBalanceWarningShown.current = true;
      setShowLowBalanceWarning(true);
    }
  }, [avatar.pricePerMinute, tokensConsumed, userProfile.tokenBalance]);

  /**
   * Checks if the user's token balance has been fully depleted
   * Handles floating-point precision with >= comparison
   *
   * @returns true if tokens consumed equals or exceeds available balance
   */
  const checkBalanceDepleted = useCallback((): boolean => {
    return tokensConsumed >= userProfile.tokenBalance;
  }, [tokensConsumed, userProfile.tokenBalance]);

  /**
   * Initiates a new session with balance validation
   * Transitions: idle -> initializing -> active
   * Shows alert and blocks if insufficient balance
   */
  const handleStartSession = useCallback(() => {
    if (!checkSufficientBalance()) {
      alert('Insufficient balance to start session');
      return;
    }

    setSessionState('initializing');

    // Simulate connection delay
    setTimeout(() => {
      setSessionState('active');
    }, CONNECTION_DELAY_MS);
  }, [checkSufficientBalance]);

  /**
   * Terminates the current session
   * Transitions: active -> ending -> ended
   * Displays session summary with duration and tokens charged
   */
  const handleEndSession = useCallback(() => {
    setSessionState('ending');

    setTimeout(() => {
      setSessionState('ended');
      const minutes = Math.floor(sessionDuration / SECONDS_PER_MINUTE);
      const seconds = sessionDuration % SECONDS_PER_MINUTE;
      alert(
        `Session ended.\n\nDuration: ${minutes}m ${seconds}s\nTokens charged: ${tokensConsumed.toFixed(2)}`
      );
    }, SESSION_END_DELAY_MS);
  }, [sessionDuration, tokensConsumed]);

  /**
   * Timer effect - runs every second during active session
   * Responsibilities:
   * 1. Increment session duration
   * 2. Calculate and update tokens consumed
   * 3. Check for low balance warning
   * 4. Auto-terminate session if balance depleted
   */
  useEffect(() => {
    if (sessionState === 'active') {
      const interval = setInterval(() => {
        setSessionDuration((prev) => {
          const newDuration = prev + 1;

          // Calculate tokens consumed in real-time
          const consumed = calculateTokensConsumed(newDuration);
          setTokensConsumed(consumed);

          return newDuration;
        });
      }, TIMER_INTERVAL_MS);

      return () => clearInterval(interval);
    }
  }, [sessionState, calculateTokensConsumed]);

  /**
   * Safety checks effect - monitors balance during active session
   * Separated from timer for better separation of concerns
   */
  useEffect(() => {
    if (sessionState === 'active') {
      // Check for low balance warning
      checkLowBalance();

      // Auto-terminate if balance is depleted
      if (checkBalanceDepleted()) {
        handleEndSession();
      }
    }
  }, [
    sessionState,
    tokensConsumed,
    checkLowBalance,
    checkBalanceDepleted,
    handleEndSession,
  ]);

  return {
    sessionState,
    sessionDuration,
    tokensConsumed,
    showLowBalanceWarning,
    handleStartSession,
    handleEndSession,
  };
}
