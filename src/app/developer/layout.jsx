import SettingsLayout from "@/components/SettingsLayout";

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
    title: "Developers",
    href: "/developer/developers",
  },
  {
    title: "Organizations",
    href: "/developer/organizations",
  },
  {
    title: "Communities",
    href: "/developer/communities",
  },
  {
    title: "Users",
    href: "/developer/users",
  },
  {
    title: "Posts",
    href: "/developer/posts",
  },
  {
    title: "Commands",
    href: "/developer/commands",
  },
  {
    title: "Parishes",
    href: "/developer/parishes",
  },
  {
    title: "Zipcodes",
    href: "/developer/zipcodes",
  },
  {
    title: "Phone Lookup",
    href: "/developer/phone-lookup",
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
        title="12More Developer"
        description="Manage your account settings and set e-mail preferences."
        sidebarNavItems={sidebarNavItems}
        children={children}
      />
    </>
  );
}