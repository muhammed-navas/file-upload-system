'use client';

import React from 'react';
import { ButtonWithLink } from '@/components/ui/Button';

export default function HomePage() {


  return (
    <div className="min-h-screen ">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">SecureFiles</h1>
          </div>
          <div className="flex gap-2">
          <ButtonWithLink label='Sign In' link="/login" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure File Storage
            <span className="block text-primary">Made Simple</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Store, manage, and access your files securely in the cloud. 
            Built with modern security practices and designed for ease of use.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonWithLink label='Get Start' link="/register" />
            <ButtonWithLink label='Sign In' link="/login" />
          </div>
        </div>
      </section>
    </div>
  );
}