// app/developer/layout.jsx
import SettingsLayout from "@/components/SettingsLayout";
import { Toaster } from "@/components/ui/toaster";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Developer",
    href: "/developer",
  },
  {
    title: "Send SMS",
    href: "/developer/send-sms",
  },
];

export default function DeveloperLayout({ children }) {
  return (
    <>
      <SettingsLayout
        title="TwelveMore Developer"
        description="Manage your account settings and set e-mail preferences."
        sidebarNavItems={sidebarNavItems}
        children={children}
      />
    </>
  );
}