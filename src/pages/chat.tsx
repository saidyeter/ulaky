import { Accounts } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { createContext, useState, useContext, useMemo } from "react";
import { api } from "../utils/api";

const ChatIdContext = createContext(
  {} as [number, React.Dispatch<React.SetStateAction<number>>]
);
//  const [chatId, setChatId]  = useContext(ChatContext);

const Chat: NextPage = () => {
  const chatIdState = useState(0);

  return (
    <ChatIdContext.Provider value={chatIdState}>
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
    </ChatIdContext.Provider>
  );
};

export default Chat;

function ChatList() {
  const [_, setChatId] = useContext(ChatIdContext);

  const [receiver, setReceiver] = useState(0);
  const [searching, setSearching] = useState(false);
  const chats = api.message.getChats.useQuery(
    {},
    {
      enabled: !searching,
    }
  );
  const [searchKey, setSearchKey] = useState("");
  const [foundUsers, setFoundUsers] = useState<Accounts[]>([]);

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
        Array.isArray(chats.data.chats) &&
        chats.data.chats.map((val, i) => {
          return (
            <div
              key={i}
              className="flex flex-row items-center justify-center border-b-2 py-4 px-2"
            >
              <div className="w-1/4">
                <img
                  src={"/api/photo/" + val.receiverImageId}
                  className="h-12 w-12 rounded-full object-cover"
                  alt=""
                />
              </div>
              <div className="w-full">
                <div className="text-lg font-semibold">
                  {val.receiverDisplayName}
                </div>
                <span className="text-gray-500">{val.lastMessageText}</span>
              </div>
            </div>
          );
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
  const [chatId, setChatId] = useContext(ChatIdContext);
  const [message, setMessage] = useState("");
  const chats = api.message.getMessages.useQuery(
    {
      chatId: chatId,
    },
    {
      enabled: chatId !== 0,
    }
  );
  function sendMessage() {}
  if (chatId === 0) {
    return <></>;
  }

  return (
    <>
      <div>messages</div>
      <div>
        {chats.data?.messages.map((val, i) => {
          return <div key={i}>{val.chat_id}</div>;
        })}
      </div>
      <input onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>send message</button>
    </>
  );
}
