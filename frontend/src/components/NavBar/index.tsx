import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { FiEdit } from 'react-icons/fi';
import logo from '@/assets/images/flow-blog-logo.png';
import Image from 'next/image';
import styles from '@/styles/NavBar.module.css';
import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import { User } from '@/models/user';
import profilePicPlaceholder from '@/assets/images/profile-pic-placeholder.png';
import * as UsersApi from '@/network/api/user';
import { useContext } from 'react';
import { AuthModalsContext } from '../auth/AuthModalsProvider';

interface LoggedInViewProps {
  user: User;
}

const LoggedInView = ({ user }: LoggedInViewProps) => {
  const { mutateUser } = useAuthenticatedUser();

  const logout = async () => {
    try {
      await UsersApi.logout();
      mutateUser(null);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <Nav className="ms-auto">
      <Nav.Link
        as={Link}
        href="/blog/new-post"
        className="link-primary d-flex align-items-center gap-1"
      >
        <FiEdit />
        Create a post
      </Nav.Link>
      <Navbar.Text className="ms-md-3">
        Hey, {user.displayName || 'User'}!
      </Navbar.Text>
      <NavDropdown
        className={styles.accountDropdown}
        title={
          <Image
            src={user.profilePicUrl || profilePicPlaceholder}
            width={40}
            height={40}
            alt="User profile picture"
            className="rounded-circle"
          />
        }
      >
        {user.username && (
          <>
            <NavDropdown.Item as={Link} href={`/users/${user.username}`}>
              Profile
            </NavDropdown.Item>
            <NavDropdown.Divider />
          </>
        )}
        <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );
};

const LoggedOutView = () => {
  const authModalsContext = useContext(AuthModalsContext);
  return (
    <Nav className="ms-auto">
      <Button
        variant="outline-primary"
        onClick={() => authModalsContext.showLoginModal()}
        className="ms-md-2 mt-2 mt-md-0"
      >
        Log In
      </Button>
      <Button
        className="ms-md-2 mt-2 mt-md-0"
        onClick={() => authModalsContext.showSignUpModal()}
      >
        Sign Up
      </Button>
    </Nav>
  );
};

const NavBar = () => {
  const { user } = useAuthenticatedUser();
  const router = useRouter();
  return (
    <Navbar expand="md" collapseOnSelect variant="dark" bg="body" sticky="top">
      <Container>
        <Navbar.Brand as={Link} href="/" className="d-flex gap-1">
          <Image src={logo} alt="Flow Blog Logo" width={30} height={30} />
          <span className={styles.brandText}>Flow Blog</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav>
            <Nav.Link as={Link} href="/" active={router.pathname === '/'}>
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/blog"
              active={router.pathname === '/blog'}
            >
              Articles
            </Nav.Link>
          </Nav>
          {user ? <LoggedInView user={user} /> : <LoggedOutView />}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
