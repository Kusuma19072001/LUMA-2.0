import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getUserByEmail } from '../utils/userDB';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const user = await getUserByEmail(email);
      if (user) {
        // In demo mode, just show success message
        setMessage({
          type: 'success',
          text: 'Reset link sent (demo mode). In production, you would receive an email with password reset instructions.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Email not found. Please check your email address or sign up for a new account.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#E8FFF5] via-[#F0FDF4] to-[#F6FAFF] px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Forgot Password Card */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/70">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-3 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              Forgot Password?
            </h1>
            <p className="mt-2 text-emerald-700/80 dark:text-emerald-300/80">
              Enter your email and we'll send you reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div
                className={`rounded-2xl p-4 text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

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
                  required
                  className="w-full rounded-2xl border border-emerald-200 bg-white/80 py-3 pl-12 pr-4 text-emerald-900 placeholder-emerald-400/60 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-600 dark:bg-slate-700/80 dark:text-emerald-100 dark:placeholder-emerald-400/40 dark:focus:border-emerald-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#4CC9B0] to-[#3AA58A] py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

