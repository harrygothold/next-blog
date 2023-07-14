import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthenticatedUser from '../useAuthenticatedUser';

const useOnboadingRedirect = () => {
  const { user } = useAuthenticatedUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.username && router.pathname !== '/onboarding') {
      router.push(`/onboarding?returnTo=${router.asPath}`);
    }
  }, [user, router]);
};

export default useOnboadingRedirect;
