import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";
import Head from "next/head";
import { useState } from "react";

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
        <NavHeader />
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#254B62]">
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
        py-4
        px-4
        text-lg 
        text-white
        md:py-0
      "
      >
        <div>
          <a href="/">
            <h3>Messaging App</h3>
          </a>
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
                  <a className="block py-2 hover:scale-125 md:p-4" href="/chat">
                    chat
                  </a>
                </li>
                <li>
                  <a
                    className="block py-2 hover:scale-125 md:p-4"
                    href="/profile"
                  >
                    profile
                  </a>
                </li>
                <li>
                  <a
                    className="block py-2 hover:scale-125 md:p-4"
                    href="#"
                    onClick={() =>
                      signOut({
                        callbackUrl: "/",
                      })
                    }
                  >
                    {data.user.name} -&gt;
                  </a>
                </li>
                <li>
                  <img
                    className="w-8 rounded-full"
                    src={data.user.image ?? ""}
                    alt="log"
                  />
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    className="block py-2 hover:scale-125 md:p-4"
                    href="#"
                    onClick={() => signIn()}
                  >
                    login
                  </a>
                </li>
                <li>
                  <a
                    className="block py-2 hover:scale-125 md:p-4"
                    href="register"
                  >
                    signup
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
