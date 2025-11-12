'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bot,
    User,
    Send,
    BarChart3,
    Heart,
    Activity,
    TrendingUp,
    Pill,
    Apple,
    Home,
    MessageCircle,
    Settings,
    Calendar,
    FileText,
    Bell,
    LogOut,
} from 'lucide-react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';

// Import the new component that holds the switch logic
import { DashboardContent } from '@/components/DashboardContent';

// Note: All other component imports (Charts, Logs, etc.) are moved
// to DashboardContent and OverviewContent

export default function Dashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState('overview');
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const navigationItems = [
        {
            title: 'Dashboard',
            items: [
                { title: 'Overview', icon: BarChart3, id: 'overview' },
                { title: 'AI Assistant', icon: MessageCircle, id: 'chat' },
            ],
        },
        {
            title: 'Health',
            items: [
                { title: 'Glucose Log', icon: Heart, id: 'glucose' },
                { title: 'Medications', icon: Pill, id: 'medications' },
                { title: 'Meals', icon: Apple, id: 'meals' },
            ],
        },
        {
            title: 'Tools',
            items: [
                { title: 'Calendar', icon: Calendar, id: 'calendar' },
                { title: 'Reports', icon: FileText, id: 'reports' },
                { title: 'Settings', icon: Settings, id: 'settings' },
            ],
        },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
                const token = localStorage.getItem('token');

                if (!token) throw new Error('No token found');

                const res = await fetch(API_BASE_URL + '/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch user');

                const data = await res.json();
                setCurrentUser(data.name);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Auth Error:', error.message);
                } else {
                    // 2. Handle cases where something else was thrown
                    console.error('An unknown error occurred:', error);
                }

                // If user fetch fails, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/auth/signin');
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth/signin');
        } catch (err) {
            console.error('Logout failed:', err);
            router.push('/auth/signin');
        }
    };

    // The AppSidebar component is defined inside Dashboard
    // This is fine as it uses state (currentUser) from its parent
    const AppSidebar = () => {
        const { setOpenMobile } = useSidebar();

        const handleMenuItemClick = (viewId: string) => {
            setActiveView(viewId);
            setOpenMobile(false);
        };

        return (
            <Sidebar variant="inset">
                <SidebarHeader>
                    <div className="flex items-center space-x-2 px-2 py-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                DiabetesAI
                            </span>
                            <p className="text-xs text-gray-500">Dashboard</p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    {navigationItems.map((group) => (
                        <SidebarGroup key={group.title}>
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                onClick={() =>
                                                    handleMenuItemClick(item.id)
                                                }
                                                isActive={
                                                    activeView === item.id
                                                }
                                                className="w-full"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <Link href="/">
                            <SidebarMenuButton className="w-full">
                                <Home className="h-4 w-4" />
                                <span>Back to Home</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenu>

                    <div className="px-2 py-2">
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700">
                                {currentUser ? currentUser : 'Loading...'}
                            </span>
                        </div>
                    </div>

                    <div className="px-2 py-2">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        );
    };

    // renderContent function is GONE

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <AppSidebar />
                <SidebarInset className="flex-1">
                    {/* Mobile Header */}
                    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-3 sm:px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base sm:text-xl font-semibold truncate">
                                    Dashboard
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                                    Welcome back,{' '}
                                    {currentUser ? currentUser : 'Loading...'}!
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hidden md:inline-flex text-xs">
                            Online
                        </Badge>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-3 sm:p-4 lg:p-6">
                        {/* We now render the DashboardContent component */}
                        <DashboardContent activeView={activeView} />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
