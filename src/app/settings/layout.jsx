import SettingsLayout from "@/components/SettingsLayout";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Profile",
    href: "/settings",
  },
]

export default function UserSettingsLayout({ children }) {
  return (
    <SettingsLayout
      title="TwelveMore Settings"
      description="Manage your account settings and set e-mail preferences."
      sidebarNavItems={sidebarNavItems}
      children={children}
    />
  );
}
