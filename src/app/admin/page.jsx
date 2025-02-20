import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/app/admin/profile-form"

export default function SettingsProfilePage() {
  const sidebarNavItems = [
    {
      title: "Home",
      href: "/home",
    },
    {
      title: "Profile",
      href: "/administrator",
    },
    {
      title: "Communities",
      href: "/administrator/communities",
    },
    {
      title: "Organizations",
      href: "/administrator/organizations",
    },
    {
      title: "Prompts",
      href: "/administrator/prompts",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  )
}
