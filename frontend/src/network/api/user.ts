import { User } from '@/models/user';
import api from '@/network/axiosInstance';

interface SignUpValues {
  username: string;
  email: string;
  password: string;
  verificationCode: string;
}

export const signUp = async (credentials: SignUpValues) => {
  const response = await api.post<User>('/users/signup', credentials);
  return response.data;
};

export const requestEmailVerificationCode = async (email: string) => {
  await api.post('/users/verification-code', { email });
};

interface LoginValues {
  username: string;
  password: string;
}

export const login = async (credentials: LoginValues) => {
  const response = await api.post<User>('/users/login', credentials);
  return response.data;
};

export const getAuthenticatedUser = async () => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

export const logout = async () => {
  await api.post('/users/logout');
};

export const getUserByUsername = async (username: string) => {
  const response = await api.get<User>(`/users/profile/${username}`);
  return response.data;
};

interface UpdateUserValues {
  username?: string;
  displayName?: string;
  about?: string;
  profilePic?: File;
}

export const updateUser = async (input: UpdateUserValues) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  const response = await api.patch<User>('/users/me', formData);
  return response.data;
};
