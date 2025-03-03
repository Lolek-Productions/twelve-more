import SettingsLayout from "@/components/SettingsLayout";
import {RedirectToSignIn, SignedIn, SignedOut} from "@clerk/nextjs";
import SessionWrapper from "@/components/SessionWrapper.jsx";

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
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <SessionWrapper>
          <SettingsLayout
            title="TwelveMore Settings"
            description="Manage your account settings and set e-mail preferences."
            sidebarNavItems={sidebarNavItems}
            children={children}
          />
        </SessionWrapper>
      </SignedIn>
    </div>
  );
}
