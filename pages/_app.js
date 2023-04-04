import Aos from 'aos';
import { useEffect } from 'react';
import SrollTop from '../components/common/ScrollTop';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cards';
import 'aos/dist/aos.css';
import '../styles/index.scss';
import { Provider } from 'react-redux';
import { store, persistor } from '../app/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

if (typeof window !== 'undefined') {
  require('bootstrap/dist/js/bootstrap');
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });
  }, []);

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
