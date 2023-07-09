import * as UsersApi from '@/network/api/user';
import { UnauthorizedError } from '@/network/http-errors';
import useSWR from 'swr';

const useAuthenticatedUser = () => {
  const { data, isLoading, error, mutate } = useSWR('user', async () => {
    try {
      return await UsersApi.getAuthenticatedUser();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return null;
      } else {
        throw error;
      }
    }
  });

  return {
    user: data,
    userLoading: isLoading,
    userLoadingError: error,
    mutateUser: mutate,
  };
};

export default useAuthenticatedUser;
