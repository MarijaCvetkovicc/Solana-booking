import dynamic from "next/dynamic";
import Head from "next/head";
import "../styles/globals.css";

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  {
    ssr: false,
  }
);
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Reserve accomodation</title>
      </Head>
      <WalletConnectionProvider>
        <Component {...pageProps} />
      </WalletConnectionProvider>
    </>
  );
}

export default MyApp;
