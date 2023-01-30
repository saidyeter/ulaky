import { type NextPage } from "next";
import Head from "next/head";

const Chat: NextPage = () => {
  return (
    <>
      <Head>
        <title>Chat</title>
      </Head>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Chat
        </h1>
      </div>
    </>
  );
};

export default Chat;
