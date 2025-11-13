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
    Bot,
    BarChart3,
    Heart,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { Hero3D } from '@/components/hero-3d';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const features = [
        {
            icon: <Bot className="h-8 w-8 text-blue-500" />,
            title: 'AI-Powered Chatbot',
            description:
                'Get instant answers to your diabetes-related questions from our intelligent assistant trained on medical knowledge.',
        },
        {
            icon: <BarChart3 className="h-8 w-8 text-green-500" />,
            title: 'Interactive Analytics',
            description:
                'Visualize your blood sugar trends, medication adherence, and lifestyle patterns with beautiful, interactive charts.',
        },
        {
            icon: <Heart className="h-8 w-8 text-red-500" />,
            title: 'Health Monitoring',
            description:
                'Track your daily glucose levels, meals, exercise, and medications in one comprehensive platform.',
        },
        {
            icon: <Shield className="h-8 w-8 text-purple-500" />,
            title: 'Personalized Insights',
            description:
                'Receive tailored recommendations based on your unique health data and diabetes management goals.',
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-500" />,
            title: 'Real-time Alerts',
            description:
                'Get notified about medication reminders, unusual glucose patterns, and important health milestones.',
        },
        {
            icon: <Users className="h-8 w-8 text-indigo-500" />,
            title: 'Community Support',
            description:
                'Connect with others on similar journeys and share experiences in a supportive environment.',
        },
    ];

    const teamMembers = [
        {
            name: 'Moksh Agrawal',
            role: 'ET22BTCO001',
            specialty: 'AI/ML',
            image: '/moksh.png?height=120&width=120',
        },
        {
            name: 'Tisha Chauhan',
            role: 'ET22BTCO018',
            specialty: 'AI/ML',
            image: '/tisha.jpg?height=120&width=120',
        },
        {
            name: 'Krish Chovatiya',
            role: 'ET22BTCO019',
            specialty: 'Frontend',
            image: '/krish.png?height=120&width=120',
        },
        {
            name: 'Nikunj Gajera',
            role: 'ET22BTCO033',
            specialty: 'Backend',
            image: '/nikunj.png?height=120&width=120',
        },
        {
            name: 'Harsh Gharsandiya',
            role: 'ET22BTCO037',
            specialty: 'Backend',
            image: '/harsh.jpg?height=120&width=120',
        },
    ];

    const advisors = [
        {
            name: 'Vasundhra Uchhula',
            role: 'Project Advisor',
            specialty: 'Academic Supervisor',
            image: '/profvasundhara.png?height=120&width=120',
        },
        {
            name: 'Dr. Sanjay Patel',
            role: 'M.D. Consultant Physician',
            specialty: 'Medical Advisor',
            image: '/drsanjaypatel.png?height=120&width=120',
        },
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
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                DiabetesAI
                            </span>
                        </div>
                        <Link href={token ? '/dashboard' : '/auth/signin'}>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                {token ? 'Dashboard' : 'Sign In'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section with 3D Vector */}
            <section className="relative py-8 sm:py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-4">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    AI-Powered Healthcare
                                </Badge>
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                    Smart{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Diabetes
                                    </span>{' '}
                                    Management
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                                    Empower your diabetes journey with AI-driven
                                    insights, personalized recommendations, and
                                    comprehensive health tracking. Take control
                                    of your health with intelligent technology.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href={token ? '/dashboard' : '/auth/signin'}
                                >
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-base sm:text-lg px-6 sm:px-8 py-3"
                                    >
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 border-2 bg-transparent"
                                    asChild
                                >
                                    <Link href="/learn-more">Learn More</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="h-48 sm:h-64 lg:h-80 w-full">
                            <Canvas>
                                {/* Optional: Add lights so your 3D object isn't pitch black */}
                                <ambientLight intensity={0.5} />
                                <directionalLight
                                    position={[10, 10, 5]}
                                    intensity={1}
                                />

                                {/* Your actual 3D component */}
                                <Hero3D />
                            </Canvas>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            Features
                        </Badge>
                        <h2 className="text-4xl font-bold">
                            Everything You Need for Diabetes Management
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our comprehensive platform combines cutting-edge AI
                            technology with proven medical practices to provide
                            you with the best diabetes management experience.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <CardHeader className="space-y-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            Our Team
                        </Badge>
                        <h2 className="text-4xl font-bold">
                            Meet the Team Behind DiabetesAI
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our dedicated team of students and advisors working
                            together to create an innovative diabetes management
                            platform.
                        </p>
                    </div>

                    {/* Team Members */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-center mb-8">
                            Development Team
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
                            {teamMembers.map((member, index) => (
                                <Card
                                    key={index}
                                    className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <CardHeader className="space-y-4">
                                        <div className="mx-auto">
                                            <img
                                                src={
                                                    member.image ||
                                                    '/placeholder.svg'
                                                }
                                                alt={member.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-base sm:text-lg">
                                                {member.name}
                                            </CardTitle>
                                            <CardDescription className="font-medium text-blue-600 text-sm">
                                                {member.role}
                                            </CardDescription>
                                            <CardDescription className="text-xs sm:text-sm">
                                                {member.specialty}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Advisors */}
                    <div>
                        <h3 className="text-2xl font-bold text-center mb-8">
                            Project Advisors
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
                            {advisors.map((advisor, index) => (
                                <Card
                                    key={index}
                                    className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <CardHeader className="space-y-4">
                                        <div className="mx-auto">
                                            <img
                                                src={
                                                    advisor.image ||
                                                    '/placeholder.svg'
                                                }
                                                alt={advisor.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-base sm:text-lg">
                                                {advisor.name}
                                            </CardTitle>
                                            <CardDescription className="font-medium text-blue-600 text-sm">
                                                {advisor.role}
                                            </CardDescription>
                                            <CardDescription className="text-xs sm:text-sm">
                                                {advisor.specialty}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-white">
                            Ready to Transform Your Diabetes Management?
                        </h2>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            Join thousands of users who have already improved
                            their health outcomes with DiabetesAI. Start your
                            journey to better diabetes management today.
                        </p>
                        <Link href={token ? '/dashboard' : '/auth/signin'}>
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
                            >
                                Get Started Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                DiabetesAI
                            </span>
                        </div>
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
