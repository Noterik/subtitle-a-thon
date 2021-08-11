import { useEffect } from 'react'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Footer from '../components/Footer'

import { init } from "@socialgouv/matomo-next";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
  });

  return <>
          <Component {...pageProps} />
          <Footer />
        </>
}

export default MyApp
