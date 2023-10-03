import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta name='description' content="Tripcentral is Dubai's leading corporate travel management Company with offices in Dubai and Mumbai. Leading Middle East businesses choose Tripcentral for their business travel needs." />
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
