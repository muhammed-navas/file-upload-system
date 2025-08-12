'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('Logged in successfully');
      window.location.href = '/home';
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-black sm:text-5xl">Sign In</h2>
      </div>
      <form onSubmit={handleSubmit} className='mx-auto mt-16 max-w-xl sm:mt-20'>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className='block text-sm/6 font-semibold text-black' >Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className='block w-full rounded-md  px-3.5 py-2 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500'
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className='block text-sm/6 font-semibold text-black' >Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className='block w-full rounded-md  px-3.5 py-2 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500'
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4 mt-4">
          <Button type='submit' label={loading ? 'Signing in...' : 'Sign In'} />
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}