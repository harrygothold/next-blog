import GithubSignInButton from '../GithubSignInButton';
import GoogleSignInButton from '../GoogleSignInButton';

const SocialSignInSection = () => {
  return (
    <div className="d-flex flex-column gap-2">
      <GoogleSignInButton />
      <GithubSignInButton />
    </div>
  );
};

export default SocialSignInSection;
