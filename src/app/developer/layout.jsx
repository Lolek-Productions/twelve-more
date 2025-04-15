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
  // Stats submenu
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
      }
    ]
  },
  {
    title: "Commands",
    href: "/developer/commands",
  },
  // Location submenu
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
      }
    ]
  },
  // Communication submenu
  {
    title: "Communication",
    children: [
      {
        title: "Lookup IP",
        href: "/developer/lookup-ip",
      },
      {
        title: "Phone Lookup",
        href: "/developer/phone-lookup",
      },
      {
        title: "Send SMS",
        href: "/developer/send-sms",
      }
    ]
  }
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