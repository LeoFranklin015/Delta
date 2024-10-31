"use client";

import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Navigation } from "./navigation";

import { useRouter, usePathname } from "next/navigation";
import { NearContext } from "@/wallets/near";
import { simpleGptContract } from "@/config";

import { getMessages } from "@/lib/getMessage";

export function NearSimpleGpt() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState("Simple GPT");

  const router = useRouter();
  const currentPath = usePathname();
  const CONTRACT = simpleGptContract;

  //Wallet
  const { signedAccountId, wallet } = useContext(NearContext);

  //get the url path

  useEffect(() => {
    console.log(currentPath);
    setSelectedRoute(
      currentPath === "/"
        ? "Simple GPT"
        : currentPath === "/functioncall"
        ? "GPT with FunctionCall"
        : "Agent"
    );
  }, [currentPath]);

  useEffect(() => {
    setIsLogoVisible(messages.length === 0);
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      setMessages([...messages, { role: "user", content: inputMessage }]);
      const response = await wallet.callMethod({
        contractId: CONTRACT,
        method: "startChat",
        args: { message: inputMessage },
        gas: "300000000000000",
      });
      console.log(response);
      const callbackResponse = await wallet.viewMethod({
        contractId: CONTRACT,
        method: "getMessageHistory",
        args: { chatId: response },
      });
      console.log(callbackResponse);

      let isFound = false;
      const pollInterval = setInterval(async () => {
        if (isFound) {
          clearInterval(pollInterval);
          return;
        }
        const updatedResponse = await wallet.viewMethod({
          contractId: CONTRACT,
          method: "getMessageHistory",
          args: { chatId: response },
        });
        if (
          updatedResponse &&
          updatedResponse.length > callbackResponse.length
        ) {
          console.log(updatedResponse.length, callbackResponse.length);
          const message = {
            role: updatedResponse[updatedResponse.length - 1].role,
            content:
              updatedResponse[updatedResponse.length - 1].content[0].value,
          };
          setMessages((prevmessages) => [...prevmessages, message]);
          isFound = true;
        }

        console.log(updatedResponse);
      }, 5000);
    }
  };

  const handleRouteChange = (route) => {
    setSelectedRoute(route);
    if (route === "Simple GPT") {
      router.push("/");
      return;
    } else if (route === "GPT with FunctionCall") {
      router.push("/functioncall");
      return;
    } else if (route === "Agent") {
      router.push("/agent");
      return;
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        yoyo: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex h-screen bg-black text-green-400">
      <motion.div
        className="w-64 bg-gray-900 p-4 border-r border-green-400/20"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold mb-4">Examples</h2>
        {["Simple GPT", "GPT with FunctionCall", "Agent"].map((route) => (
          <motion.button
            key={route}
            className={`w-full text-left p-2 rounded-lg mb-2 ${
              selectedRoute === route
                ? "bg-green-400/20"
                : "hover:bg-green-400/10"
            }`}
            onClick={() => handleRouteChange(route)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {route}
          </motion.button>
        ))}
      </motion.div>
      <div className="flex flex-col flex-grow">
        <motion.header
          className="p-4 border-b border-green-400/20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">NEAR GPT - {selectedRoute}</h1>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Navigation />
            </motion.div>
          </div>
        </motion.header>
        <ScrollArea className="flex-grow p-4">
          <AnimatePresence>
            {isLogoVisible && (
              <motion.div
                className="flex flex-col items-center justify-center h-full"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={logoVariants}
              >
                <motion.div
                  className="w-64 h-64 mb-8"
                  animate={{
                    rotate: 360,
                    transition: {
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <motion.path
                      d="M50 10 L90 90 L10 90 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <motion.circle
                      cx="50"
                      cy="45"
                      r="10"
                      fill="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    />
                  </svg>
                </motion.div>
                <motion.h2
                  className="text-7xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  NEAR.GPT
                </motion.h2>
                <motion.p
                  className="text-2xl text-center max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Bringing AI on-chain with the power of NEAR Protocol
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`mb-4 ${
                  message.role === "user" ? "text-right" : ""
                }`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === "user" ? "bg-green-400/20" : "bg-gray-800"
                  } max-w-[80%]`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <motion.div
                    className="flex items-center mt-2 space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw].map(
                      (Icon, i) => (
                        <motion.div
                          key={i}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                          >
                            <Icon className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
        <motion.div
          className="p-4 border-t border-green-400/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Message NEAR GPT..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow bg-gray-800 text-green-400 border-green-400/20 focus:border-green-400 placeholder-green-400/50"
            />
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                onClick={handleSendMessage}
                className="bg-green-400 hover:bg-green-500 text-black"
              >
                Send
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-center mt-2 text-green-400/50">
            NEAR GPT can make mistakes. Consider checking important information.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
