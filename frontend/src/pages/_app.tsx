import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout/Layout';
import '../styles/globals.css'; // If you have global styles

// Define proper types for pages with layouts
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, or use default Layout
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
