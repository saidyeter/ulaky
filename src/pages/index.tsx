import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { data, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <></>;
  }

  if (data?.user) {
    router.push("chat").catch((e) => {
      console.log("couldnt navigate to chat", e);
    });
  }

  return (
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          welcome to
          <br /> Messaging App
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <a
            href="#"
            onClick={() =>
              signIn().catch((e) => {
                console.log("couldnt signin", e);
              })
            }
          >
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
              <h3 className="text-2xl font-bold">login →</h3>
              <div className="text-lg">to continue please login</div>
            </div>
          </a>
          <a href="register">
            <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
              <h3 className="text-2xl font-bold">sign up →</h3>
              <div className="text-lg">
                don&apos;t you have an account? register
              </div>
            </div>
          </a>
        </div>
      </div>
  );
};

export default Home;
