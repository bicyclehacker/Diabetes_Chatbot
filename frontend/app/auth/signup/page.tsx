'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/api';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Please agree to the terms and conditions');
            setIsLoading(false);
            return;
        }

        try {
            const { token, user } = await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // localStorage.setItem('token', token);
            // localStorage.setItem('user', JSON.stringify(user));

            router.push('/auth/signin');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkAuthStatus = () => {
            // 1. Check for the 'token' in localStorage instead of 'user'
            const token = localStorage.getItem('token');

            // 2. If the token exists, redirect to the dashboard
            if (token) {
                router.replace('/dashboard');
            }
            // 3. If no token, do nothing and stay on the current page.
        };

        // Run the check on component mount
        checkAuthStatus();

        // Re-run the check if the user switches back to this tab
        const handleVisibility = () => {
            if (!document.hidden) {
                checkAuthStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        // Cleanup the event listener on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md space-y-4 sm:space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            DiabetesAI
                        </span>
                    </Link>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1 text-center px-4 sm:px-6 py-4 sm:py-6">
                        <CardTitle className="text-xl sm:text-2xl font-bold">
                            Create your account
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Join DiabetesAI to start managing your diabetes with
                            AI assistance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="h-10 sm:h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="h-10 sm:h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="h-10 sm:h-11"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'confirmPassword',
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="h-10 sm:h-11"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            'agreeToTerms',
                                            checked as boolean
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm text-gray-600"
                                >
                                    I agree to the{' '}
                                    <Link
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href="#"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">
                                Already have an account?{' '}
                            </span>
                            <Link
                                href="/auth/signin"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo Info */}
                {/* <Card className="border border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-blue-800">
                                Demo Mode
                            </p>
                            <p className="text-xs text-blue-600">
                                For testing: Use any valid email and password
                                (min 6 chars)
                            </p>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    );
}
