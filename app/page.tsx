'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // First authentication step - eboard API
      const eboardResponse = await axios.post('http://eboard.ecews.org/api/account/login', {
        email,
        password
      });

      if (!eboardResponse.data.token) {
        throw new Error('Invalid credentials');
      }

      // Second authentication step - internal API
      const localResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_baseURL}/auth/login`,
        { email, password },
        {
          headers: {
            'Authorization': `Bearer ${eboardResponse.data.token}`
          }
        }
      );

      if (!localResponse.data.access_token || !localResponse.data.user) {
        throw new Error('Failed to authenticate with internal system');
      }

      // Sign in with NextAuth
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
        access_token: localResponse.data.access_token,
        user: JSON.stringify(localResponse.data.user)
      });

      if (signInResult?.error) {
        setError(signInResult.error);
      } else {
        router.push('/cma/dashboard');
      }

    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Authentication failed');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Logo Section */}
      <div className="flex justify-center  flex-col items-center">
        <div className="relative w-48">
          <Image
            src="/images/ecews-logo.png"
            alt="HIV Case Management Dashboard Logo"
            width={2048}
            height={661}
            className=""
          />
          
        </div>
        
      </div>
      <h1 className="text-xl font-bold text-[#096D49] mb-2">
          SPEED CASE MANAGEMENT SYSTEM
      </h1>

      {/* Main Content */}
      <div className="w-2/3 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header Section */}
          <div className="text-center">
            
            {/* <p className="text-sm text-gray-600">
              Sign in to access your HIV Case Management Dashboard
            </p> */}
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    Email Address
                  </span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50 sm:text-sm transition-colors"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <FaLock className="mr-2 text-gray-400" />
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50 sm:text-sm transition-colors"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#096D49] hover:bg-[#075238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FaUserShield className="mr-2 h-5 w-5" />
                      Login
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>© {new Date().getFullYear()} SPEED Project. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
