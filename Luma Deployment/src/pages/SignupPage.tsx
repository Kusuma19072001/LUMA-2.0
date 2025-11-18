import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Sparkles } from 'lucide-react';

export function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup(firstName, lastName, email, password);
      navigate('/home', { state: { greeting: `Welcome, ${firstName}!` } });
    } catch (err) {
      if (err instanceof Error && err.message === 'Email already exists') {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({ general: err instanceof Error ? err.message : 'Signup failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#E8FFF5] via-[#F0FDF4] to-[#F6FAFF] px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Signup Card */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/70">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-3 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              Join LUMA
            </h1>
            <p className="mt-2 text-emerald-700/80 dark:text-emerald-300/80">
              Start your wellness journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full rounded-2xl border bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-600 dark:focus:border-red-500'
                        : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-600 dark:focus:border-emerald-500'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full rounded-2xl border bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 ${
                      errors.lastName
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-600 dark:focus:border-red-500'
                        : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-600 dark:focus:border-emerald-500'
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-600 dark:focus:border-red-500'
                      : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-600 dark:focus:border-emerald-500'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-600 dark:focus:border-red-500'
                      : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-600 dark:focus:border-emerald-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:outline-none focus:ring-2 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20 dark:border-red-600 dark:focus:border-red-500'
                      : 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-slate-600 dark:focus:border-emerald-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#4CC9B0] to-[#3AA58A] py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-emerald-700/80 dark:text-emerald-300/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

