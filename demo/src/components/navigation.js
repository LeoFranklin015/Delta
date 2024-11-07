import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";

import { NearContext } from "@/wallets/near";
import NearLogo from "/public/near-logo.svg";
import { Button } from "./ui/button";

export const Navigation = () => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [action, setAction] = useState(() => {});
  const [label, setLabel] = useState("Loading...");

  useEffect(() => {
    if (!wallet) return;

    if (signedAccountId) {
      setAction(() => wallet.signOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => wallet.signIn);
      setLabel("Login");
    }
  }, [signedAccountId, wallet]);

  return (
    <Button
      className="bg-green-400 hover:bg-green-500 text-black"
      onClick={action}
    >
      {" "}
      {label}{" "}
    </Button>
  );
};
