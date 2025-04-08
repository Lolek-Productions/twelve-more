"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  getNewCommunityCountForDateRange,
  getNewOrganizationCountForDateRange,
  getNewPostCountForDateRange,
  getNewUserCountForDateRange
} from "@/lib/actions/stats.js"
import { DatePicker } from "@/components/ui/date-picker.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"
import { Button } from "@/components/ui/button.jsx"
import moment from "moment-timezone"
import {getActiveUsers, getClerkDailyActiveUsers} from "@/lib/actions/clerk-stats.js";

export default function StatsPage() {
  const [userCount, setUserCount] = useState(null)

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // Convert date to UTC, considering it was in Central Time
  const convertToUTC = (date) => {
    // Create a moment object in Central Time
    const centralTime = moment.tz(date, "America/Chicago")

    // Convert to UTC
    return centralTime.utc().toDate()
  }

  // Function to load all stats with a single date range
  const loadAllStats = async (from, to) => {
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

      // console.log(`Querying from ${startDateISO} to ${endDateISO}`)

      // Load all stats in parallel
      const clerkResponse = await getActiveUsers(startDateISO, endDateISO);
      console.log("clerkResponse", clerkResponse);

      setUserCount(clerkResponse.count)

    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for applying the date range
  const handleApplyDateRange = async () => {
    await loadAllStats(startDate, endDate)
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
    loadAllStats(startDate, endDate)
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
      <h1 className="text-2xl font-bold mb-1">Active User Statistics</h1>
      <h2 className="mb-2">The start date will set the beginning of the selected day.  The end date will select the end of the selected date.</h2>
      <h2 className="text-sm mb-3">All data is in Central Time.</h2>

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
              <span>User Statistics for: {getDateRangeString()}</span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-blue-500 font-medium">Active Users for Range</div>
              <div className="text-2xl font-bold text-blue-700">
                {isLoading ? '...' : userCount}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}