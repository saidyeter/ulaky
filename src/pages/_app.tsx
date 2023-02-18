import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "../utils/api";

import "../styles/globals.css";
import Head from "next/head";
import { useState } from "react";
import Link from "next/link";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <>
        <Head>
          <title>Ulaky</title>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>
        <main className="min-h-screen bg-[#254B62]">
          <NavHeader />
          <Component {...pageProps} />
        </main>
      </>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

function NavHeader() {
  const [hiddenMenu, setHiddenMenu] = useState(true);
  const { data } = useSession();

  return (
    <header>
      <nav
        className="
        flex w-full
        flex-wrap
        items-center
        justify-between
        bg-[#1D3E53]
        px-4
        text-lg 
        text-white
        md:py-0
      "
      >
        <Link href="/">
          <Image src="/logo/white.svg" alt="logo" width={200} height={100} />
        </Link>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="menu-button"
          className="block h-6 w-6 cursor-pointer md:hidden"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={() => setHiddenMenu((p) => !p)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>

        <div
          className={`${
            hiddenMenu ? "hidden" : ""
          } w-full md:flex md:w-auto md:items-center`}
          id="menu"
        >
          <ul
            className="
            items-center
            pt-4
            text-base
            md:flex 
            md:justify-between
            md:pt-0	
            "
          >
            {data?.user ? (
              <>
                <li>
                  <Link
                    href="/chat"
                    className="block py-2 hover:scale-125 md:p-4"
                  >
                    chat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="block py-2 hover:scale-125 md:p-4"
                  >
                    {data.user.image && (
                      <Image
                        className="rounded-full"
                        width={32}
                        height={32}
                        src={data.user.image}
                        alt="log"
                      />
                    )}
                  </Link>
                </li>
                <li>
                  <button
                    className="block py-2 hover:scale-125 md:p-4"
                    onClick={() =>
                      signOut({
                        callbackUrl: "/",
                      })
                    }
                  >
                    <Image
                      src="/logout.svg"
                      alt="logo"
                      width={25}
                      height={100}
                    />
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    className="block py-2 hover:scale-125 md:p-4"
                    onClick={() => signIn()}
                  >
                    login
                  </button>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block py-2 hover:scale-125 md:p-4"
                  >
                    register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
