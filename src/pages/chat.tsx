import { Accounts } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "../utils/api";

const Chat: NextPage = () => {
  return (
    <>
      <Head>
        <title>Chat</title>
      </Head>
      <div className="flex flex-row bg-slate-300">
        <div className="w-1/4 border border-white">
          <span>chats</span>
          <ChatList />
        </div>
        <div className="w-3/4 border border-white">
          <span>mesagebox</span>
          <ChatBox />
        </div>
      </div>
    </>
  );
};

export default Chat;

function ChatList() {
  const [searching, setSearching] = useState(false);
  const chats = api.message.getChats.useQuery(
    {},
    {
      enabled: !searching,
    }
  );
  const [searchKey, setSearchKey] = useState("");
  const [foundUsers, setFoundUsers] = useState<Accounts[]>([]);
  const [receiver, setReceiver] = useState(0);

  const searchUser = api.message.searchUser.useQuery(
    {
      searchKey: searchKey,
    },
    {
      enabled: searching,
    }
  );

  async function searchContact() {
    setSearching(true);

    const usersToSelect = await searchUser.refetch();
    if (usersToSelect.data?.success) {
      console.log(usersToSelect.data.accounts);

      setFoundUsers(usersToSelect.data?.accounts);
    }
    console.log("start new chat");
  }

  function startChat(receiverId: number) {
    // console.log("startChat with " + receiverId);
    setReceiver(receiverId);
    //fetch message history
  }
  return (
    <>
      <div className="flex flex-row items-start justify-center">
        <input
          className="w-full p-2"
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <button disabled={searchKey.length < 3} onClick={searchContact}>
          search contact
        </button>
      </div>

      {!searching ? (
        chats.data?.success &&
        chats.data.chats.map((val, i) => {
          return <div key={i}>{val.chat_id}</div>;
        })
      ) : (
        <div>
          {foundUsers.map((val, i) => {
            return (
              <div
                key={i}
                className="flex flex-row items-center justify-around border-2 border-white bg-slate-400 text-white "
              >
                <span className="text-lg">{val.display_name}</span>
                <span className="text-sm">@{val.username}</span>
                <button onClick={() => startChat(val.id)}>chat</button>
              </div>
            );
          })}
          <button onClick={() => setSearching(false)}>cancel search</button>
        </div>
      )}
    </>
  );
}

function ChatBox() {
  const [receiver, setReceiver] = useState(0);
  const [message, setMessage] = useState("");

  function sendMessage() {}
  if (receiver === 0) {
    return <></>;
  }

  return (
    <>
      <div>messages</div>
      <input onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>send message</button>
    </>
  );
}
