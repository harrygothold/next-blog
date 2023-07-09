import { User } from '@/models/user';
import api from '@/network/axiosInstance';

interface SignUpValues {
  username: string;
  email: string;
  password: string;
}

export const signUp = async (credentials: SignUpValues) => {
  const response = await api.post<User>('/users/signup', credentials);
  return response.data;
};

interface LoginValues {
  username: string;
  password: string;
}

export const login = async (credentials: LoginValues) => {
  const response = await api.post<User>('/users/login', credentials);
  return response.data;
};