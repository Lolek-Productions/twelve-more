"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useMainContext } from "@/components/MainContextProvider.jsx";
import { getUserSettings, saveUserSettings } from "@/lib/actions/user";
import {useApiToast} from "@/lib/utils.js";

const defaultSettings = {
  notifyOnNewPostInCommunity: true,
  notifyOnPostLiked: true,
  notifyOnPostPrayedFor: true,
  notifyOnNewMemberInCommunity: true,
  notifyOnCommentOnMyPost: true,
  notifyOnCommentOnCommentedPost: false,
  preferredCommunication: "sms",
};

export default function SettingsPage() {
  const { appUser } = useMainContext();

  const [settings, setSettings] = useState(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const { showResponseToast, showErrorToast } = useApiToast();

  useEffect(() => {
    if (appUser) {
      const fetchSettings = async () => {
        const settingData = await getUserSettings(appUser.id);
        if (settingData.success && settingData.settings) {
          setSettings(settingData.settings);
        } else {
          setSettings(defaultSettings);
        }
      };
      fetchSettings();
    }
  }, [appUser]);

  function handleNotificationChange(key, value) {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const response = await saveUserSettings(appUser.id, settings)
      showResponseToast(response);

      if (response.success && response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSavingSettings(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <>
      <div className='py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
        <h2 className='text-lg sm:text-xl font-bold'>
          <div>User Settings</div>
        </h2>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSaveNotifications} className="bg-white rounded-lg shadow p-6 mb-8 m-6">
        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-1">
            <span>Notify me when a new post is created in a community I belong to</span>
            <Switch checked={settings.notifyOnNewPostInCommunity} onCheckedChange={val => handleNotificationChange('notifyOnNewPostInCommunity', val)} />
          </div>
          <div className="flex items-center justify-between gap-1">
            <span>Notify me when my post is liked</span>
            <Switch checked={settings.notifyOnPostLiked} onCheckedChange={val => handleNotificationChange('notifyOnPostLiked', val)} />
          </div>
          <div className="flex items-center justify-between gap-1">
            <span>Notify me when my post is prayed for</span>
            <Switch checked={settings.notifyOnPostPrayedFor} onCheckedChange={val => handleNotificationChange('notifyOnPostPrayedFor', val)} />
          </div>
          <div className="flex items-center justify-between gap-1">
            <span>Notify me when someone new joins a community I am part of</span>
            <Switch checked={settings.notifyOnNewMemberInCommunity} onCheckedChange={val => handleNotificationChange('notifyOnNewMemberInCommunity', val)} />
          </div>
          <div className="flex items-center justify-between gap-1">
            <span>Notify me when someone comments on my post</span>
            <Switch checked={settings.notifyOnCommentOnMyPost} onCheckedChange={val => handleNotificationChange('notifyOnCommentOnMyPost', val)} />
          </div>
          {/* <div className="flex items-center justify-between gap-1">
            <span>Notify me when someone comments on a post I have commented on</span>
            <Switch checked={settings.notifyOnCommentOnCommentedPost} onCheckedChange={val => handleNotificationChange('notifyOnCommentOnCommentedPost', val)} />
          </div> */}
        </div>
        <Button type="submit" className="mt-6" disabled={savingSettings} onClick={handleSaveNotifications}>
          {savingSettings ? "Saving..." : "Save Notification Settings"}
        </Button>
      </form>

      {/* Placeholder for second settings area */}
      {/* <div className="bg-white rounded-lg shadow p-6 m-6">
        <h2 className="text-lg font-semibold mb-4">Other Settings</h2>
        <p className="text-gray-600">More settings coming soon...</p>
      </div> */}
    </>
  );
}

