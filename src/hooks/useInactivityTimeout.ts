
"use client";

import { useEffect, useCallback, useRef } from 'react';

const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useInactivityTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, LOCK_TIMEOUT);
  }, [onTimeout]);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };
    
    const handleVisibilityChange = () => {
      // Lock immediately if the app is hidden and then shown again after the timeout has passed.
      // This handles the case where the browser might throttle timeouts in background tabs.
      if (document.visibilityState === 'visible') {
        resetTimer();
      } else {
        // When the tab is hidden, we set a timeout.
        // If the user doesn't return within the timeout period, onTimeout will be called.
        resetTimer();
      }
    };

    // Add event listeners for user activity
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Add event listener for tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial timer setup
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer]);
}
