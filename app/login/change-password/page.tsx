import { Suspense } from 'react';
import ChangePasswordClient from './ChangePasswordClient';

export const viewport = {
  themeColor: '#4f46e5',
};

export const metadata = {
  title: 'Change Password',
  description: 'Change your account password',
};

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChangePasswordClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}