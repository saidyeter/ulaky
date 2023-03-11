import { Accounts } from "@prisma/client";
import { type NextPage } from "next";
import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../utils/api";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { clientEnv, serverEnv } from "../env/schema.mjs";

const ChatIdContext = createContext(
  {} as [number, React.Dispatch<React.SetStateAction<number>>]
);
const supabase = createClient(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
  clientEnv.NEXT_PUBLIC_SUPABASE_KEY ?? "",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
let channel: RealtimeChannel | undefined = undefined;

const Chat: NextPage = () => {
  console.log("conn", channel?.state);
  const chatIdState = useState(0);
  const { data } = useSession();

  if (!channel) {
    channel = supabase
      .channel("*")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: "account_id=eq." + data?.user.id,
        },
        (payload) => {
          console.log(payload);
        }
      )
  }


  useEffect(() => {
    console.log('channel', channel?.state);
    
    if (channel && channel.state === 'closed'){
      channel = channel.subscribe();
    }
    return () => {
      if (channel && channel.state === 'joined') {
        supabase.removeChannel(channel);
        console.log("removed channel");
      }
    };
  }, [channel]);

  return (
    <ChatIdContext.Provider value={chatIdState}>
      <div className="flex flex-row bg-slate-300">
        <div className="w-1/4 border border-white">
          <ChatList />
        </div>
        <div className="w-3/4 border border-white">
          <ChatBox />
        </div>
      </div>
    </ChatIdContext.Provider>
  );
};

export default Chat;

function ChatList() {
  const [_, setChatId] = useContext(ChatIdContext);

  const [searching, setSearching] = useState(false);

  const startChatMutation = api.message.startChat.useMutation();

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
      enabled: searching && searchKey.length > 2,
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

  function startChat(username: string) {
    startChatMutation.mutate(
      {
        receiverUsername: username,
      },
      {
        onSuccess(data, variables, context) {
          if (data && data.success) {
            setSearchKey("");
            setChatId(data.chatId ?? 0);
          }
        },
      }
    );
  }
  return (
    <>
      <div className="flex flex-row items-start justify-center">
        <input
          className="w-full p-2"
          onChange={(e) => setSearchKey(e.target.value)}
          value={searchKey}
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
                <Image
                  src={"/api/photo/" + val.receiverImageId}
                  className="rounded-full object-cover"
                  width={48}
                  height={48}
                  alt=""
                />
              </div>
              <div className="w-full">
                <div className="text-lg font-semibold">
                  {val.receiverDisplayName}
                </div>
                <span className="text-gray-500">{val.lastMessageText}</span>
              </div>

              <div className="">
                <button
                  className="block py-2 hover:scale-125 md:p-4"
                  onClick={() => {
                    setChatId(val.chatId);
                  }}
                >
                  <Image
                    src="/arrow-circle-right.svg"
                    alt="logo"
                    width={80}
                    height={100}
                  />
                </button>
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
                <button onClick={() => startChat(val.username)}>chat</button>
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
  const { data } = useSession();

  const sendMessageMutation = api.message.sendMessage.useMutation();
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
  function sendMessage() {
    sendMessageMutation.mutate(
      { text: message, chatId },
      {
        onSuccess() {
          setMessage("");
          chats.refetch();
        },
      }
    );
  }
  if (chatId === 0) {
    return <></>;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-4">
      <div className="w-full p-4">
        {chats.data?.success &&
          Array.isArray(chats.data.messages) &&
          chats.data?.messages.map((val, i, arr) => {
            return (
              <div key={i} className="w-full">
                {data?.user.id === val.sender.toString() ? (
                  <div className="flex w-full items-end justify-end">
                    <span>{val.text}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-fit border bg-red-200">
                      <div className="flex gap-1">
                        <Image
                          src={"/api/photo/" + val.image_id}
                          className="rounded-full object-cover"
                          width={24}
                          height={24}
                          alt=""
                        />
                        <span className="font-semibold">
                          {val.display_name} &nbsp;
                        </span>
                        <span className="italic">{val.username} &nbsp;</span>
                      </div>
                      <span>{val.text}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <div className="flex w-full gap-4 p-4">
        <input
          className="w-full"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button onClick={sendMessage}>send message</button>
      </div>
    </div>
  );
}
