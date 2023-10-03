import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta name='description' content='Leading Corporate Travel Company based in Mumbai. Established in 2005, with offices in Mumbai and Dubai, Xplorz is the leading Travel management company for the Top 10 Private Equity and Financial Services companies in India. When it comes to Corporate Travel, the best businesses choose Xplorz for servicing their needs.' />
        {/* <!-- Google fonts --> */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='true' />
        <link
          href='https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap'
          rel='stylesheet'
        />

        <meta
          name='keywords'
          content='Corporate travel, flight booking, car rentals, hotel bookings , visa services, Forex, business travel, business class , first class'
        />

        <link rel='icon' href='/favicon.ico' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
