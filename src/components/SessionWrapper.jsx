'use client';

import { Provider } from 'jotai'

export default function SessionWrapper({ children }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
}
