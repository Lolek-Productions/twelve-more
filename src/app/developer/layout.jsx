import SettingsLayout from "@/components/SettingsLayout";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Courses",
    href: "/developer/courses",
  },
  {
    title: "New Activity",
    href: "/developer",
  },
  {
    title: "Database",
    children: [
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
    ]
  },
  {
    title: "Stats",
    children: [
      {
        title: "User Stats",
        href: "/developer/user-stats",
      },
      {
        title: "Community Stats",
        href: "/developer/community-stats",
      },
      {
        title: "Daily Stats",
        href: "/developer/daily-stats",
      }
    ]
  },
  {
    title: "Location Services",
    children: [
      {
        title: "Parishes",
        href: "/developer/parishes",
      },
      {
        title: "Zipcode Proximity",
        href: "/developer/zipcodes",
      },
      {
        title: "Parish Proximity",
        href: "/developer/parish-proximity",
      },
      {
        title: "Lookup IP",
        href: "/developer/lookup-ip",
      },
      {
        title: "Phone Lookup",
        href: "/developer/phone-lookup",
      },
    ]
  },
  {
    title: "Developer",
    children: [
      {
        title: "Developers Themselves",
        href: "/developer/developers",
      },
      {
        title: "Send SMS",
        href: "/developer/send-sms",
      },
      {
        title: "Commands",
        href: "/developer/commands",
      },
    ]
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