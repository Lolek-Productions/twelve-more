'use client';

import {useAppUser} from "@/hooks/useAppUser.js";

export default function SelectedOrganizationName() {
  const {appUser} = useAppUser();

  return (<>
    {appUser?.selectedOrganization?.name}
  </>)
}