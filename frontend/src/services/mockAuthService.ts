import { User } from '../contexts/AuthContext';

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'admin' as const,
    organizations: [
      { id: '1', name: 'Data Science Team' },
      { id: '2', name: 'Research Group' }
    ],
    bio: 'Data scientist with 5+ years of experience in machine learning and AI.',
    jobTitle: 'Lead Data Scientist',
    socialLinks: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe'
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'user' as const,
    organizations: [
      { id: '1', name: 'Data Science Team' }
    ],
    bio: 'Data analyst specializing in visualization and business intelligence.',
    jobTitle: 'Data Analyst',
    socialLinks: {
      github: 'https://github.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith'
    }
  },
  {
    id: '3',
    name: 'Matty Squarzoni',
    email: 'matty@prjctcode.ai',
    password: 'test1234',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    role: 'admin' as const,
    organizations: [
      { id: '1', name: 'Data Science Team' },
      { id: '2', name: 'Research Group' },
      { id: '3', name: 'Project Code' }
    ],
    bio: 'Full-stack developer and data scientist with expertise in AI and machine learning.',
    jobTitle: 'Senior AI Engineer',
    socialLinks: {
      github: 'https://github.com/mattysquarzoni',
      linkedin: 'https://linkedin.com/in/mattysquarzoni'
    }
  }
];

// Generate a JWT-like token (not a real JWT, just for mock purposes)
const generateMockToken = (userId: string, expiresIn: number = 3600): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
};

// Mock login function
export const mockLogin = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find user
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Generate tokens
  const accessToken = generateMockToken(user.id);
  const refreshToken = generateMockToken(user.id, 86400); // 24 hours
  
  // Create user object
  const userData: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    organization: user.organizations[0],
    preferences: {
      theme: 'light',
      dashboardLayout: 'default',
      notifications: true
    },
    bio: user.bio,
    jobTitle: user.jobTitle,
    socialLinks: user.socialLinks
  };
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: userData
  };
};

// Mock register function
export const mockRegister = async (name: string, email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if email is already in use
  if (MOCK_USERS.some(u => u.email === email)) {
    throw new Error('Email already in use');
  }
  
  // Create new user
  const newUserId = `user-${Date.now()}`;
  
  // Generate tokens
  const accessToken = generateMockToken(newUserId);
  const refreshToken = generateMockToken(newUserId, 86400); // 24 hours
  
  // Create user object
  const userData: User = {
    id: newUserId,
    name,
    email,
    role: 'user',
    organization: { id: '1', name: 'Data Science Team' },
    preferences: {
      theme: 'light',
      dashboardLayout: 'default',
      notifications: true
    },
    bio: '',
    jobTitle: '',
    socialLinks: {}
  };
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: userData
  };
};

// Mock refresh token function
export const mockRefreshToken = async (refreshToken: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, we would validate the refresh token
  // For mock purposes, we'll just generate a new access token
  
  // Extract user ID from refresh token (mock implementation)
  const payload = refreshToken.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload));
  const userId = decodedPayload.sub;
  
  // Generate new access token
  const newAccessToken = generateMockToken(userId);
  
  return {
    access_token: newAccessToken,
    refresh_token: refreshToken // Keep the same refresh token
  };
};

// Mock get user function
export const mockGetUser = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, we would use the token to identify the user
  // For mock purposes, we'll just return the first user
  const user = MOCK_USERS[0];
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    organization: user.organizations[0],
    preferences: {
      theme: 'light',
      dashboardLayout: 'default',
      notifications: true
    },
    bio: user.bio,
    jobTitle: user.jobTitle,
    socialLinks: user.socialLinks
  };
};

// Mock update user function
export const mockUpdateUser = async (userData: Partial<User>) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, we would update the user in the database
  // For mock purposes, we'll just return the updated user data
  
  return {
    ...userData
  };
};

// Mock logout function
export const mockLogout = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, we would invalidate the token
  // For mock purposes, we'll just return success
  
  return {
    success: true
  };
}; 