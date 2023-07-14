import '@/styles/globals.scss';
import '@/styles/utils.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { Container, SSRProvider } from 'react-bootstrap';
import styles from '@/styles/App.module.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import NextNProgress from 'nextjs-progressbar';
import useOnboadingRedirect from '@/hooks/useOnboardingRedirect';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  useOnboadingRedirect();
  return (
    <>
      <Head>
        <title>Flow Blog</title>
        <meta name="description" content="A Full Stack NextJS Project" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SSRProvider>
        <div className={inter.className}>
          <NextNProgress color="#21fa90" />
          <NavBar />
          <main>
            <Container className={styles.pageContainer}>
              <Component {...pageProps} />
            </Container>
          </main>
          <Footer />
        </div>
      </SSRProvider>
    </>
  );
}
