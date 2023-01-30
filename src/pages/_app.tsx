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
          <title>Msg App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex min-h-screen flex-col items-center justify-start pt-10 bg-[#254B62]">
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
    <header
    className="w-full fixed top-0"
    >
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
        <div>
          <Link href="/">
            <h3>Messaging App</h3>
          </Link>
        </div>

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
                    profile
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
                    {data.user.name} -&gt;
                  </button>
                </li>
                <li>
                  {data.user.image && (
                    <Image
                      className="rounded-full"
                      width={32}
                      height={32}
                      src={data.user.image}
                      alt="log"
                    />
                  )}
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
