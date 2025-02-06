'use client'

import React from 'react';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"


const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First Name must be at least 2 characters.",
    })
    .max(30, {
      message: "First Name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last must be at least 2 characters.",
    })
    .max(30, {
      message: "Last must not be longer than 30 characters.",
    }),
  phoneNumber: z
    .string()
    .min(2, {
      message: "Phone Number be at least 2 characters.",
    })
    .max(30, {
      message: "Phone Number not be longer than 30 characters.",
    }),
})

const defaultValues = {
  firstName: "Josh",
  lastName: "McCarty",
  phoneNumber: "2709858824",
}

export default function Invite(props) {
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })
  const { toast } = useToast()

  function onSubmit(data) {
    toast({
      title: "Invitation Sent",
      description: "Invitation was sent to the new user",
    })
  }

  return (
    <div className='min-h-screen max-w-xl mx-auto border-r border-l'>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>Invite to Organization</h2>
      </div>
      <div className='p-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="first name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add the first name
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="last name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add the last name
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="phone" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add the mobile phone number
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <Button type="submit">Invite</Button>
          </form>
        </Form>
      </div>
    </div>
      );
      }

