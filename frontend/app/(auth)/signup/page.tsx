'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const { signup, isSigningUp } = useAuthStore();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        const result = await signup(data);
        if (result === true) {
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } else {
            toast.error(typeof result === 'string' ? result : 'Error creating account');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="max-w-md w-full bg-base-100 rounded-3xl shadow-xl p-8 border border-base-content/5">
                <div className="text-center mb-8 relative">
                    <Link
                        href="/"
                        className="absolute -top-4 left-0 text-sm text-base-content/60 hover:text-primary flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} />
                        Home
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary mt-6">
                        Create Account
                    </h1>
                    <p className="text-base-content/60 mt-2">
                        Start your journey to financial freedom
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium pl-1">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                            <input
                                {...register('username')}
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                autoComplete="username"
                                className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all ${
                                    errors.username ? 'input-error' : ''
                                }`}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-error text-xs pl-1">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium pl-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                            <input
                                {...register('email')}
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all ${
                                    errors.email ? 'input-error' : ''
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-error text-xs pl-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium pl-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                            <input
                                {...register('password')}
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all ${
                                    errors.password ? 'input-error' : ''
                                }`}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-error text-xs pl-1">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSigningUp}
                        className="btn btn-primary w-full rounded-xl text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        {isSigningUp ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-base-content/60">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-primary font-medium hover:underline decoration-2 underline-offset-4">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
