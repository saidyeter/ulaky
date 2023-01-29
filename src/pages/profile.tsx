import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { api } from "../utils/api";

const Profile: NextPage = () => {
  const [file, setFile] = useState<any>(null);
  const [changePictureRes, setChangePictureRes] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [changePasswordRes, setChangePasswordRes] = useState("");

  function onFileChange(e: FormEvent<HTMLInputElement>) {
    setFile(e.currentTarget.files?.[0]);
  }
  const changeProfilePicture = api.user.changeProfilePicture.useMutation();

  async function uploadImage() {
    if (!file) {
      setChangePictureRes("select an image");
      return;
    }
    if (file.size > 100_000) { // 100 kb is limit
      setChangePictureRes("image is big");
      return;
    }
    if (!file.type.startsWith('image')) { // must be image
      setChangePictureRes("select an image, like jpg or png");
      return;
    }

    let b64 = "";
    try {
      const _b64 = await toBase64(file);
      if (typeof _b64 === "string" && _b64.startsWith("data:image")) {
        b64 = _b64.substring(_b64.indexOf(",") + 1);
      } else {
        setChangePictureRes("file error must bu an image ");
        return;
      }
    } catch (error) {
      console.log("file error ", error);
      setChangePictureRes("file error");
      return;
    }

    changeProfilePicture.mutate(
      {
        pictureBase64: b64,
      },
      {
        onSuccess(data, variables, context) {
          if (data.success) {
            setChangePictureRes("successful");
            setFile(null);
          } else {
            setChangePictureRes(data.msg ?? "");
          }
        },
        onError(error, variables, context) {
          setChangePictureRes(error.message ?? "");
        },
      }
    );
  }

  const changePassword = api.user.changePassword.useMutation();

  function handleChangePassword() {
    changePassword.mutate(
      {
        oldPassword,
        newPassword,
        newPasswordAgain,
      },
      {
        onSuccess(data, variables, context) {
          if (data.success) {
            setChangePasswordRes("successful");
            setOldPassword("");
            setNewPassword("");
            setNewPasswordAgain("");
          } else {
            setChangePasswordRes(data.msg ?? "");
          }
        },
        onError(error, variables, context) {
          setChangePasswordRes(error.message ?? "");
        },
      }
    );
  }
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>

      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          profile settings
        </h2>

        <input
          type="file"
          onChange={onFileChange}
          accept="image/png, image/jpeg"
        />
        <p>{changePictureRes}</p>
        <button onClick={uploadImage}>upload</button>

        <input
          placeholder=" password"
          type="password"
          className="text-2xl text-black"
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          placeholder=" password"
          type="password"
          className="text-2xl text-black"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          placeholder=" password"
          type="password"
          className="text-2xl text-black"
          onChange={(e) => setNewPasswordAgain(e.target.value)}
        />
        <p>{changePasswordRes}</p>
        <button onClick={handleChangePassword}>change password</button>
      </div>
    </>
  );
};

export default Profile;

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
