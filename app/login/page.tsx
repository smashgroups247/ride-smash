'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-gray font-dm">
      <div className="w-full max-w-[420px] px-6">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Ridesmash" width={140} height={36} className="h-8 w-auto" />
        </div>

        {/* Card */}
        <div className="bg-surface border border-border-gray rounded-[18px] p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="font-syne text-[22px] font-extrabold text-text-main tracking-[-0.4px]">
              Dashboard login
            </h1>
            <p className="text-[13px] text-text-muted mt-1">
              Enter your credentials to access the survey dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[12px] font-medium tracking-[0.06em] uppercase text-text-faint"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ridesmash.com"
                className="w-full py-3 px-4 border border-border-gray rounded-[12px] bg-bg-gray font-dm text-[14px] text-text-main outline-none transition-colors duration-150 focus:border-green placeholder-text-faint"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[12px] font-medium tracking-[0.06em] uppercase text-text-faint"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-3 px-4 border border-border-gray rounded-[12px] bg-bg-gray font-dm text-[14px] text-text-main outline-none transition-colors duration-150 focus:border-green placeholder-text-faint"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-[10px] py-2.5 px-4">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-[12px] bg-green font-syne text-[14px] font-bold text-white cursor-pointer transition-all duration-150 hover:bg-green-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-text-faint mt-5">
          Ridesmash v2 Research · Internal Dashboard
        </p>
      </div>
    </div>
  );
}
