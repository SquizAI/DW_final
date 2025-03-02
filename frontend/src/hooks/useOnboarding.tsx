import { useState, useEffect } from 'react';
import { useAuth, User } from '../contexts/AuthContext';

// Extend the User type to include creation timestamp
interface UserWithTimestamp extends User {
  createdAt?: string | Date;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in and hasn't completed onboarding
    if (user) {
      // For development purposes, we'll add a timestamp if it doesn't exist
      const userWithTimestamp = user as UserWithTimestamp;
      
      // If no onboarding has been completed and user is logged in
      if (!localStorage.getItem('onboardingCompleted')) {
        // In a real app, the user object would include a createdAt field
        // For now, we'll assume all logged-in users should see onboarding
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const openOnboarding = () => {
    setShowOnboarding(true);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
  };

  // Helper function to determine if a user is new (registered within the last 24 hours)
  const isNewUser = (createdAt: string | Date) => {
    const creationDate = new Date(createdAt);
    const now = new Date();
    const differenceInHours = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60);
    return differenceInHours < 24;
  };

  return {
    showOnboarding,
    openOnboarding,
    closeOnboarding,
    completeOnboarding
  };
} 