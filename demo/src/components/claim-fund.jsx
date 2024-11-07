"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
  impact: z.string().min(10, {
    message: "Impact description must be at least 10 characters.",
  }),
  usage: z.string().min(10, {
    message: "Usage description must be at least 10 characters.",
  }),
});

export function ClaimFund() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      impact: "",
      usage: "",
    },
  });

  function onSubmit(values) {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Claim Submitted",
        description:
          "Your fund claim has been successfully submitted for review.",
      });
      form.reset();
    }, 2000);
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
              Claim Fund
            </CardTitle>
            <CardDescription className="text-gray-400">
              Provide details about your fund usage and its impact to submit
              your claim.
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
                        Reason for Claim
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain the reason for your claim..."
                          className="resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Provide a clear explanation of why you're claiming the
                        fund.
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Impact Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the impact of the fund usage..."
                          className="resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Explain how the fund has made a difference or created an
                        impact.
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        Fund Usage
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how the funds were used..."
                          className="resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Provide details on how the funds were utilized.
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
                      Submitting Claim...
                    </>
                  ) : (
                    "Submit Claim"
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
