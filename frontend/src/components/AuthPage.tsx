import { useState } from 'react';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';

export function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Logo / header */}
      <header className="relative z-10 flex items-center gap-3 p-6">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.586-2.586A2 2 0 017 13h10a2 2 0 011.414.586L21 16V6a1 1 0 00-1-1h-2" />
          </svg>
        </div>
        <span className="font-bold text-white text-xl">AutoDrive Inventory</span>
      </header>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Hero text */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-3">
            <span className="gradient-text">Car Dealership</span>
            <br />
            <span className="text-white">Inventory System</span>
          </h1>
          <p className="text-gray-400 max-w-sm mx-auto text-sm">
            Manage your vehicle inventory, track stock levels, and process purchases — all in one place.
          </p>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-md">
          {view === 'login' ? (
            <LoginForm onSwitch={() => setView('register')} />
          ) : (
            <RegisterForm onSwitch={() => setView('login')} />
          )}
        </div>
      </div>

      <footer className="relative z-10 text-center text-gray-600 text-xs pb-6">
        Car Dealership Inventory System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
