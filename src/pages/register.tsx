import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { use, useState } from "react";

import { api } from "../utils/api";

const Register: NextPage = () => {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [registerError, setRegisterError] = useState("");

  const register = api.user.register.useMutation();
  function handleRegister() {
    console.log("register", email, name, password);
    register.mutate(
      {
        email,
        name,
        password,
      },
      {
        onSuccess(data, variables, context) {
          console.log(data, variables, context);
          if (data.success) {
            signIn("credentials", {
              callbackUrl: "/",
            });
          } else {
            setRegisterError(data.msg ?? "");
          }
        },
        onError(error, variables, context) {
          setRegisterError(error.message ?? "");
        },
      }
    );
  }
  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <input
          placeholder=" name"
          className="text-2xl text-black"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder=" email"
          className="text-2xl text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder=" password"
          type="password"
          className="text-2xl text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-red-800">{registerError}</p>
        <button className="text-2xl text-white" onClick={handleRegister}>
          register
        </button>
      </div>
    </>
  );
};

export default Register;
