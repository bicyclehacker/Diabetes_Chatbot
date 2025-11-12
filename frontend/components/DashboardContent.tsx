'use client';

// Import all your page-level components
import { GlucoseLog } from '@/components/glucose-log';
import { Medications } from '@/components/medications';
import { Meals } from '@/components/meals';
import { CalendarView } from '@/components/calendar-view';
import { Reports } from '@/components/reports';
import { Reminders } from '@/components/reminders';
import { Settings as SettingsComponent } from '@/components/settings';
import { ChatbotInterface } from '@/components/chatbot-interface';
import { Settings } from 'lucide-react'; // For the default case

// Import the new OverviewContent component
import { OverviewContent } from '@/components/OverviewContent';

// This component receives the activeView prop
export function DashboardContent({ activeView }: { activeView: string }) {
    switch (activeView) {
        case 'overview':
            return <OverviewContent />; // Render the new component
        case 'chat':
            return <ChatbotInterface />;
        case 'glucose':
            return <GlucoseLog />;
        case 'medications':
            return <Medications />;
        case 'meals':
            return <Meals />;
        case 'calendar':
            return <CalendarView />;
        case 'reports':
            return <Reports />;
        case 'reminders':
            return <Reminders />;
        case 'settings':
            return <SettingsComponent />;
        default:
            return (
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Settings className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Coming Soon
                            </h3>
                            <p className="text-gray-500">
                                This feature is under development.
                            </p>
                        </div>
                    </div>
                </div>
            );
    }
}
