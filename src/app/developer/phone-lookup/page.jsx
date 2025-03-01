"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {lookupPhoneNumber} from "@/lib/actions/clerk";


export default function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState('2708831110');
  const [users, setUsers] = useState([]);
  const [isBusy, setIsBusy] = useState(false);

  const phoneLookup = async (users) => {
    return lookupPhoneNumber(phoneNumber)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    console.log(phoneNumber);

    const response = await phoneLookup(phoneNumber);

    if(response.success){
      setUsers(response.users)
    }
    console.log(response);
    setIsBusy(false);
  };

  return (
    <div>
      <div className="space-y-0.5">
        <h3 className="text-lg font-medium">Clerk Phone Lookup</h3>
        <p className="text-sm text-muted-foreground">
          Look up a phone number to see if it exists in the authentication system with Clerk.  Note: if there is more than one user displayed below, we have a problem.
        </p>
      </div>
      <div className="mt-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 2709858824"
              required
              disabled={isBusy}
            />
          </div>
          <Button type="submit" disabled={isBusy || !phoneNumber}>
            {isBusy ? "Busy..." : "Lookup"}
          </Button>
        </form>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold my-4">User Data</h1>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
          <tr className=" text-sm">
            <th className="border p-2 text-left">First Name</th>
            <th className="border p-2 text-left">Last Name</th>
            <th className="border p-2 text-left">Clerk ID</th>
          </tr>
          </thead>
          <tbody>
          {users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{user.firstName}</td>
              <td className="border border-gray-300 p-2">{user.lastName}</td>
              <td className="border border-gray-300 p-2">{user.id}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>


    </div>
  );
}