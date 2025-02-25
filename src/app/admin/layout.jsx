import SettingsLayout from "@/components/SettingsLayout";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Administrator",
    href: "/admin",
  },
  {
    title: "Communities",
    href: "/admin/communities",
  },
  // {
  //   title: "Organizations",
  //   href: "/admin/organizations",
  // },
  // {
  //   title: "Prompts",
  //   href: "/admin/prompts",
  // },
];

export default function AdminLayout({ children }) {
  return (
    <SettingsLayout
      title="TwelveMore Settings"
      description="Manage your account settings and set e-mail preferences."
      sidebarNavItems={sidebarNavItems}
      children={children}
    />
  );
}