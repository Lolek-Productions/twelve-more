"use client"

import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {useEffect, useState} from "react";
import {checkPhoneExists} from "@/lib/actions/clerk.js";
import {
  getNewCommunityCountForDateRange,
  getNewOrganizationCountForDateRange,
  getNewPostCountForDateRange, getNewUserCountForDateRange,
  getPostCountForDateRange
} from "@/lib/actions/stats.js";
import moment from "moment";


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
  const [postCount, setPostCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [communityCount, setCommunityCount] = useState(null);
  const [organizationCount, setOrganizationCount] = useState(null);

  useEffect(() => {
    async function loadGetPostCount() {
      try {
        // Call server action to check if user exists
        const result = await getNewPostCountForDateRange(moment.now(), moment.now());

        if (result.success) {
          // console.log(result.count);
          setPostCount(result.count);
        } else {
          console.error('Problem getting count of posts');
        }
      } catch (error) {
        console.error('Error loading post count:', error);
      }
    }

    loadGetPostCount();
  }, []);

  useEffect(() => {
    async function loadGetUserCount() {
      try {
        const result = await getNewUserCountForDateRange(moment.now(), moment.now());

        if (result.success) {
          setUserCount(result.count);
        } else {
          console.error('Problem getting count of users');
        }
      } catch (error) {
        console.error('Error loading user count:', error);
      }
    }

    loadGetUserCount();
  }, []);

  useEffect(() => {
    async function loadGetCommunityCount() {
      try {
        const result = await getNewCommunityCountForDateRange(moment.now(), moment.now());

        if (result.success) {
          setCommunityCount(result.count);
        } else {
          console.error('Problem getting count of communities');
        }
      } catch (error) {
        console.error('Error loading community count:', error);
      }
    }

    loadGetCommunityCount();
  }, []);

  useEffect(() => {
    async function loadGetOrganizationCount() {
      try {
        const result = await getNewOrganizationCountForDateRange(moment.now(), moment.now());

        if (result.success) {
          setOrganizationCount(result.count);
        } else {
          console.error('Problem getting count of organizations');
        }
      } catch (error) {
        console.error('Error loading organization count:', error);
      }
    }

    loadGetOrganizationCount();
  }, []);

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
        <div className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Dashboard Statistics for the Day: {moment().format('MMMM D, YYYY')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-sm text-blue-500 font-medium">New Posts</div>
            <div className="text-2xl font-bold text-blue-700">{postCount}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-sm text-green-500 font-medium">New Users</div>
            <div className="text-2xl font-bold text-green-700">{userCount}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-md">
            <div className="text-sm text-purple-500 font-medium">New Communities</div>
            <div className="text-2xl font-bold text-purple-700">{communityCount}</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-md">
            <div className="text-sm text-amber-500 font-medium">New Organizations</div>
            <div className="text-2xl font-bold text-amber-700">{organizationCount}</div>
          </div>
        </div>
      </div>
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