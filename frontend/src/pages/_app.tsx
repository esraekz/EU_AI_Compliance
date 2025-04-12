// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import Layout from '../components/Layout/Layout';
import '../styles/globals.css'; // If you have global styles

function MyApp({ Component, pageProps }: AppProps) {
  // Check if the page is using getLayout
  const getLayout = (Component as any).getLayout || ((page: React.ReactElement) => page);

  // If the page has a custom layout, use it, otherwise use the default Layout
  return (
    <Layout>
      {getLayout(<Component {...pageProps} />)}
    </Layout>
  );
}

export default MyApp;
