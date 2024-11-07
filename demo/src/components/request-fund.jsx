"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Navigation } from "./navigation";
import { NearContext } from "@/wallets/near";
import { deltaContract } from "@/config";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  fundingAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Funding amount must be a positive number.",
    }),
});

export function RequestFund() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signedAccountId, wallet } = useContext(NearContext);
  const CONTRACT = deltaContract;
  const requestFund = async (message) => {
    await wallet.callMethod({
      contractId: CONTRACT,
      method: "request_Check",
      args: { message: message, address: signedAccountId },
      gas: "300000000000000",
    });
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      location: "",
      latitude: "",
      longitude: "",
      fundingAmount: "",
    },
  });

  async function onSubmit(values) {
    setIsSubmitting(true);
    await requestFund(values.reason + "in" + values.location);
    toast({
      title: "Fund Request Submitted",
      description: "Your request has been successfully submitted for review.",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Request Disaster Relief Fund
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please provide details about the weather conditions and your
              funding needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Reason for Bad Weather
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the weather conditions and their impact..."
                          className="resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Provide a detailed description of the weather conditions
                        and their impact on your area.
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, State/Province, Country"
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Enter the affected area's location.
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Latitude (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 40.7128"
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Longitude (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., -74.0060"
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="fundingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Funding Amount Requested (USD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Enter the amount of funding you are requesting in USD.
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
