"use client"

import React, { useState, useEffect } from "react"
import { z } from "zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import ReactMarkdown from "react-markdown"

// Zod schema for quiz question
const quizSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  questions: z.array(
    z.object({
      question: z.string().min(2, { message: "Enter a question." }),
      options: z.array(z.string().min(1)).min(2, { message: "At least 2 options required." }),
      answer: z.string().min(1, { message: "Select the correct answer." })
    })
  )
})

function OptionsFieldArray({ form, qIdx }) {
  const { control, getValues, setValue } = form;
  const optionsArray = useFieldArray({
    control,
    name: `questions.${qIdx}.options`
  });

  // Ensure at least two options always exist
  useEffect(() => {
    if (optionsArray.fields.length < 2) {
      for (let i = optionsArray.fields.length; i < 2; i++) {
        optionsArray.append("");
      }
    }
    // Only run on mount or when fields length changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsArray.fields.length]);

  return (
    <div className="flex flex-col gap-2">
      {optionsArray.fields.map((optField, oIdx) => (
        <div key={optField.id} className="flex gap-2 items-center">
          <Controller
            control={control}
            name={`questions.${qIdx}.options.${oIdx}`}
            render={({ field }) => (
              <Input {...field} />
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => optionsArray.remove(oIdx)}
            aria-label="Remove option"
            disabled={optionsArray.fields.length < 3}
          >
            -
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => optionsArray.append("")}
      >
        Add Option
      </Button>
    </div>
  );
}

export default function QuizEditor({ value, onChange }) {
  const form = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: value || {
      title: "",
      description: "",
      questions: [{ question: "", options: ["", ""], answer: "" }]
    },
    mode: "onChange"
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions"
  })

  function handleSubmit(data) {
    onChange && onChange(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
  {/* Module Details Section */}
  <div className="border rounded-lg bg-gray-50 p-4 mb-6">
    <div className="font-semibold text-gray-800 mb-3 text-base">Module Details</div>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Module Title</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Enter module title" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Module Description</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Enter module description (optional)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
        {fields.map((field, qIdx) => (
          <div key={field.id} className="p-4 border rounded-lg flex flex-col gap-2 bg-gray-50">
            <FormField
              control={form.control}
              name={`questions.${qIdx}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question (Markdown supported)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border rounded px-2 py-1 w-full min-h-[40px] text-sm"
                      placeholder="Enter your question using Markdown..."
                    />
                  </FormControl>
                  <FormDescription>
                    Supports **bold**, _italic_, lists, and links.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormLabel>Options</FormLabel>
            <OptionsFieldArray form={form} qIdx={qIdx} />
            <FormField
              control={form.control}
              name={`questions.${qIdx}.answer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
  <SelectValue placeholder="Select correct answer" />
</SelectTrigger>
                      <SelectContent>
                        {(form.getValues(`questions.${qIdx}.options`) || [])
  .filter(opt => typeof opt === "string" && opt.trim() !== "")
  .map((opt, i) => (
    <SelectItem key={i} value={opt}>{opt}</SelectItem>
  ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 mt-2 self-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => qIdx > 0 && form.setValue('questions', move(fields, qIdx, qIdx - 1))}
                disabled={qIdx === 0}
                aria-label="Move question up"
              >↑</Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => qIdx < fields.length - 1 && form.setValue('questions', move(fields, qIdx, qIdx + 1))}
                disabled={qIdx === fields.length - 1}
                aria-label="Move question down"
              >↓</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(qIdx)}
                
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ question: "", options: ["", ""], answer: "" })}
        >
          Add Question
        </Button>
        <Button type="submit" className="self-end">Save Quiz</Button>
      </form>
    </Form>
  )
}
