import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { FiEdit } from 'react-icons/fi';
import logo from '@/assets/images/flow-blog-logo.png';
import Image from 'next/image';
import styles from '@/styles/NavBar.module.css';
import useAuthenticatedUser from '@/hooks/useAuthenticatedUser';
import { useState } from 'react';
import LoginModal from '../auth/LoginModal';
import SignUpModal from '../auth/SignUpModal';

const LoggedInView = () => (
  <Nav className="ms-auto">
    <Nav.Link
      as={Link}
      href="/blog/new-post"
      className="link-primary d-flex align-items-center gap-1"
    >
      <FiEdit />
      Create a post
    </Nav.Link>
  </Nav>
);

const LoggedOutView = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpnModal, setShowSignUpModal] = useState(false);
  return (
    <>
      <Nav className="ms-auto">
        <Button
          variant="outline-primary"
          onClick={() => setShowLoginModal(true)}
          className="ms-md-2 mt-2 mt-md-0"
        >
          Log In
        </Button>
        <Button
          className="ms-md-2 mt-2 mt-md-0"
          onClick={() => setShowSignUpModal(true)}
        >
          Sign Up
        </Button>
      </Nav>
      {showLoginModal && (
        <LoginModal
          onDismiss={() => setShowLoginModal(false)}
          onSignUpInsteadClicked={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
          onForgotPasswordClicked={() => {}}
        />
      )}
      {showSignUpnModal && (
        <SignUpModal
          onDismiss={() => setShowSignUpModal(false)}
          onLoginInsteadClicked={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </>
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
          {user ? <LoggedInView /> : <LoggedOutView />}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
