"use client"

import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"


const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
}

export default function StatsPage() {

  return (
    <>
      Posts created today: {}
    </>

    // <ChartContainer config={chartConfig} className="h-[400px] w-full">
    //   <BarChart accessibilityLayer data={chartData}>
    //     <CartesianGrid vertical={false} />
    //     <XAxis
    //       dataKey="month"
    //       tickLine={false}
    //       tickMargin={10}
    //       axisLine={false}
    //       tickFormatter={(value) => value.slice(0, 3)}
    //     />
    //     <YAxis
    //       tickLine={false}
    //       axisLine={false}
    //       tickMargin={10}
    //     />
    //     <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    //   </BarChart>
    // </ChartContainer>
  )
}