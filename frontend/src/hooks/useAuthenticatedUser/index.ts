import * as UsersApi from '@/network/api/user';
import useSWR from 'swr';

const useAuthenticatedUser = () => {
  const { data, isLoading, error, mutate } = useSWR(
    'user',
    UsersApi.getAuthenticatedUser
  );

  return {
    user: data,
    userLoading: isLoading,
    userLoadingError: error,
    mutateUser: mutate,
  };
};

export default useAuthenticatedUser;
