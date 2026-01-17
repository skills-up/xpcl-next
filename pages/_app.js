import Aos from 'aos';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import SrollTop from '../components/common/ScrollTop';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'aos/dist/aos.css';
import 'nprogress/nprogress.css';
import '../styles/index.scss';
import { Provider } from 'react-redux';
import { store, persistor } from '../app/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 400 });

if (typeof window !== 'undefined') {
  require('bootstrap/dist/js/bootstrap');
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });

    // NProgress handlers for route changes
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <main>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <ToastContainer />
          <Component {...pageProps} />
          <SrollTop />
        </PersistGate>
      </Provider>
    </main>
  );
}
