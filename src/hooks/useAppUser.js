import { useAtom } from 'jotai';
import { userAtom } from '@/lib/atoms/userAtom';

export function useAppUser() {
  const [appUser, setAppUser] = useAtom(userAtom);

  return { appUser };
}