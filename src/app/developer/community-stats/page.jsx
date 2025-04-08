"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import moment from "moment-timezone"
import { getTopCommunities } from "@/lib/actions/community-stats.js"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

export default function CommunityStatsPage() {
  const [topCommunities, setTopCommunities] = useState([])
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const chartConfig = {
    desktop: {
      label: "Posts",
      color: "#2563eb",
    },
  }

  // Convert date to UTC, considering it was in Central Time
  const convertToUTC = (date) => {
    // Create a moment object in Central Time
    const centralTime = moment.tz(date, "America/Chicago")

    // Convert to UTC
    return centralTime.utc().toDate()
  }

  // Function to load community stats
  const loadCommunityStats = async (from, to) => {
    setIsLoading(true)

    try {
      // Ensure from and to are Date objects
      const fromDate = from instanceof Date ? from : new Date(from)
      const toDate = to instanceof Date ? to : new Date(to)

      // Convert dates from Central Time to UTC
      const fromUTC = convertToUTC(fromDate)
      const toUTC = convertToUTC(toDate)

      // For the end date, set it to the end of the day in UTC
      // This ensures we capture all data for that day
      toUTC.setUTCHours(23, 59, 59, 999)

      // Format dates as ISO strings for the server actions
      const startDateISO = fromUTC.toISOString()
      const endDateISO = toUTC.toISOString()

      // Get top communities data
      const communitiesResponse = await getTopCommunities({
        startDate: startDateISO,
        endDate: endDateISO
      });

      console.log("communitiesResponse", communitiesResponse);

      // Update the communities state with the new data
      if (communitiesResponse.success) {
        setTopCommunities(communitiesResponse.data)
      } else {
        console.error("Failed to fetch top communities:", communitiesResponse.error)
        setTopCommunities([])
      }

    } catch (error) {
      console.error('Error loading community stats:', error)
      setTopCommunities([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for applying the date range
  const handleApplyDateRange = async () => {
    await loadCommunityStats(startDate, endDate)
  }

  // Handler for start date change
  const handleStartDateChange = (date) => {
    setStartDate(date)
  }

  // Handler for end date change
  const handleEndDateChange = (date) => {
    setEndDate(date)
  }

  // Initial load on component mount
  useEffect(() => {
    loadCommunityStats(startDate, endDate)
  }, [])

  // Format the date range string for display
  const getDateRangeString = () => {
    try {
      const start = format(new Date(startDate), "MMMM d, yyyy")
      const end = format(new Date(endDate), "MMMM d, yyyy")
      return start === end ? start : `${start} - ${end}`
    } catch (error) {
      console.error("Error formatting date range:", error)
      return "Selected date range"
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Community Statistics</h1>
      <h2 className="mb-1">The start date will set the beginning of the selected day. The end date will select the end of the selected date.</h2>
      <h2 className="mb-2 text-xs">Note: this listing includes comments, i.e. since comments are essentially posts in our database, we are lumping comments into these numbers.</h2>

      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              date={startDate}
              onSelect={handleStartDateChange}
              label="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              date={endDate}
              onSelect={handleEndDateChange}
              label="Select end date"
            />
          </div>
        </div>
        <Button
          onClick={handleApplyDateRange}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Loading...' : 'Update Statistics'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {isLoading ? (
              <span>Loading statistics...</span>
            ) : (
              <span>Communities with top number of post for: {getDateRangeString()}</span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : topCommunities.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart accessibilityLayer data={topCommunities}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="communityName"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 5)} // Show up to 10 characters
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <Tooltip
                  formatter={(value, name) => [value, 'Posts']}
                  labelFormatter={(label) => `Community: ${label}`}
                />
                <Bar dataKey="posts" fill="var(--color-desktop)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center">
              <p>No community data available for this date range.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}