import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  accountType: 'videographer' | 'client';
};

function Register() {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormData>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto pt-16">
      <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">
        Create Account
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-orange-400 text-lg mb-2">
            Full Name
          </label>
          <div className="relative">
            <input
              {...register('name')}
              type="text"
              className="w-full bg-[#333] text-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div>
          <label className="block text-orange-400 text-lg mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              className="w-full bg-[#333] text-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Enter your email"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div>
          <label className="block text-orange-400 text-lg mb-2">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type="password"
              className="w-full bg-[#333] text-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Create a password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div>
          <label className="block text-orange-400 text-lg mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-center p-4 bg-[#333] rounded-lg cursor-pointer hover:bg-[#444] transition-colors">
              <input
                type="radio"
                {...register('accountType')}
                value="videographer"
                className="sr-only peer"
              />
              <div className="flex items-center peer-checked:text-blue-500">
                <Camera className="w-5 h-5 mr-2" />
                <span>Videographer</span>
              </div>
            </label>
            <label className="flex items-center justify-center p-4 bg-[#333] rounded-lg cursor-pointer hover:bg-[#444] transition-colors">
              <input
                type="radio"
                {...register('accountType')}
                value="client"
                className="sr-only peer"
              />
              <div className="flex items-center peer-checked:text-blue-500">
                <User className="w-5 h-5 mr-2" />
                <span>Client</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;