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
        title="TwelveMore Developer"
        description="Manage your account settings and set e-mail preferences."
        sidebarNavItems={sidebarNavItems}
        children={children}
      />
    </>
  );
}