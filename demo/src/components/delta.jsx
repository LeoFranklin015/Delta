"use client";

import { motion } from "framer-motion";
import { Cloud, Shield, Upload, PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Navigation } from "./navigation";

export function Delta() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      title: "Create Pool",
      description:
        "Create a weather data pool to support climate disaster relief",
      icon: PlusCircleIcon,
      href: "/delta/create-pool",
      color:
        "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20",
    },
    {
      title: "Request Fund",
      description:
        "Submit weather data and request climate disaster relief funding",
      icon: Cloud,
      href: "/delta/request-fund",
      color:
        "from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20",
    },
    {
      title: "Post Disaster Claim",
      description: "Submit proof and unlock remaining funds post-disaster",
      icon: Upload,
      href: "/delta/claim-fund",
      color:
        "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header
        className="p-4 border-b border-green-400/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Delta</h1>
          <motion.div whileHover="hover" whileTap="tap">
            <Navigation />
          </motion.div>
        </div>
      </motion.header>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Delta
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            A public good fund for disaster relief - powered by federated ML
            models on-chain to support mitigation and relief using AI verified
            impact verifiers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Link href={card.href}>
                <div
                  className={`relative overflow-hidden rounded-xl p-8 h-full bg-gradient-to-r ${card.color} border border-gray-800 transition-all duration-300`}
                >
                  <div className="relative z-10">
                    <card.icon className="w-12 h-12 mb-4 text-white" />
                    <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                    <p className="text-gray-400 mb-4">{card.description}</p>
                    <div className="flex items-center text-blue-400">
                      <span className="mr-2">Go to</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{
                      x: hoveredCard === index ? ["-100%", "100%"] : "-100%",
                    }}
                    transition={{
                      duration: 1,
                      repeat: hoveredCard === index ? Infinity : 0,
                      ease: "linear",
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-800">
            <Shield className="w-6 h-6 mr-2 text-blue-400" />
            <span className="text-gray-400">
              Powered by Federated On-chain ML Models
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
