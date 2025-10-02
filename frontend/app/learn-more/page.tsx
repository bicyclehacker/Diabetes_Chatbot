'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Heart,
    Bot,
    BarChart3,
    Shield,
    Users,
    CheckCircle,
    Star,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LearnMore() {
    const benefits = [
        {
            icon: <Bot className="h-6 w-6 text-blue-500" />,
            title: 'AI-Powered Insights',
            description:
                'Get personalized recommendations based on your unique health patterns and medical history.',
            features: [
                '24/7 AI assistant',
                'Personalized advice',
                'Pattern recognition',
                'Smart alerts',
            ],
        },
        {
            icon: <BarChart3 className="h-6 w-6 text-green-500" />,
            title: 'Comprehensive Tracking',
            description:
                'Monitor all aspects of your diabetes management in one integrated platform.',
            features: [
                'Blood glucose monitoring',
                'Medication tracking',
                'Meal logging',
                'Exercise tracking',
            ],
        },
        {
            icon: <Shield className="h-6 w-6 text-purple-500" />,
            title: 'Medical-Grade Security',
            description:
                'Your health data is protected with enterprise-level security and privacy measures.',
            features: [
                'HIPAA compliant',
                'End-to-end encryption',
                'Secure data storage',
                'Privacy controls',
            ],
        },
        {
            icon: <Users className="h-6 w-6 text-orange-500" />,
            title: 'Healthcare Integration',
            description:
                'Seamlessly share data with your healthcare team for better coordinated care.',
            features: [
                'Doctor sharing',
                'Report generation',
                'Appointment sync',
                'Care team access',
            ],
        },
    ];

    const testimonials = [
        {
            name: 'Maria Rodriguez',
            role: 'Type 2 Diabetes Patient',
            content:
                'DiabetesAI has transformed how I manage my diabetes. The AI insights help me make better daily decisions.',
            rating: 5,
        },
        {
            name: 'Dr. James Wilson',
            role: 'Endocrinologist',
            content:
                "The comprehensive reports from DiabetesAI give me valuable insights into my patients' daily management.",
            rating: 5,
        },
        {
            name: 'Sarah Chen',
            role: 'Type 1 Diabetes Patient',
            content:
                'The medication reminders and glucose tracking have significantly improved my adherence and control.',
            rating: 5,
        },
    ];

    const stats = [
        // { number: '10,000+', label: 'Active Users' },
        // { number: '95%', label: 'User Satisfaction' },
        { number: '24/7', label: 'AI Support' },
        { number: 'HIPAA', label: 'Compliant' },
        { number: 'Personalized', label: 'Care Insights' },
        { number: 'Global', label: 'Access Anywhere' },
    ];

    const [token, setToken] = useState(false);

    useEffect(() => {
        const t = localStorage.getItem('token');
        setToken(!!t);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                DiabetesAI
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <Link href={token ? '/dashboard' : '/auth/signin'}>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    {token ? 'Dashboard' : 'Sign In'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 sm:space-y-8">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Learn More About DiabetesAI
                        </Badge>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            Revolutionizing{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Diabetes Care
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                            Discover how our AI-powered platform combines
                            cutting-edge technology with proven medical
                            practices to provide you with the most comprehensive
                            diabetes management solution available today.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm sm:text-base text-gray-600">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-12 sm:mb-16">
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            Key Benefits
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            Why Choose DiabetesAI?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform offers unique advantages that set us
                            apart from traditional diabetes management tools.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                        {benefits.map((benefit, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <CardHeader className="space-y-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                        {benefit.icon}
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        {benefit.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                                        {benefit.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {benefit.features.map(
                                            (feature, featureIndex) => (
                                                <div
                                                    key={featureIndex}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">
                                                        {feature}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-12 sm:mb-16">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            How It Works
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            Simple Steps to Better Health
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                            Getting started with DiabetesAI is easy and takes
                            just a few minutes.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Sign Up & Setup',
                                description:
                                    'Create your account and complete your health profile with basic information.',
                            },
                            {
                                step: '2',
                                title: 'Start Tracking',
                                description:
                                    'Begin logging your glucose readings, medications, and meals using our intuitive interface.',
                            },
                            {
                                step: '3',
                                title: 'Get AI Insights',
                                description:
                                    'Receive personalized recommendations and insights based on your health patterns.',
                            },
                        ].map((step, index) => (
                            <Card
                                key={index}
                                className="text-center border-0 shadow-lg"
                            >
                                <CardHeader className="space-y-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="text-white font-bold text-lg">
                                            {step.step}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        {step.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* <section className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-12 sm:mb-16">
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                            Testimonials
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            What Our Users Say
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                            Real stories from people who have transformed their
                            diabetes management with DiabetesAI.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardHeader className="space-y-4">
                                    <div className="flex space-x-1">
                                        {[...Array(testimonial.rating)].map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                                />
                                            )
                                        )}
                                    </div>
                                    <CardDescription className="text-sm sm:text-base leading-relaxed italic">
                                        "{testimonial.content}"
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <p className="font-medium text-sm sm:text-base">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* CTA Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-700">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6 sm:space-y-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Ready to Take Control of Your Health?
                        </h2>
                        <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
                            Join thousands of users who have already improved
                            their diabetes management with DiabetesAI. Start
                            your journey to better health today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={token ? '/dashboard' : '/auth/signin'}>
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                                >
                                    {token ? 'Dashboard' : 'Get Started Free'}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                                >
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                DiabetesAI
                            </span>
                        </Link>
                        <p className="text-gray-400">
                            Empowering better health through intelligent
                            diabetes management.
                        </p>
                        <p className="text-sm text-gray-500">
                            © 2025 DiabetesAI. All rights reserved. This
                            platform is for educational purposes and should not
                            replace professional medical advice.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
