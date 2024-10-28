import Image from "next/image";

import NearLogo from "/public/near.svg";
import NextLogo from "/public/next.svg";
import styles from "./app.module.css";
import { Cards } from "@/components/cards";
import { NearGpt } from "@/components/near-gpt";
import { NearAiChat } from "@/components/near-ai-chat";

export default function Home() {
  return <NearAiChat />;
}
