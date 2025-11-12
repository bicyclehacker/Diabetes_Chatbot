'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Pill, Apple } from 'lucide-react';
import { GlucoseChart } from '@/components/glucose-chart';
import { WeeklyOverview } from '@/components/weekly-overview';
import { MedicationChart } from '@/components/medication-chart';
import { api } from '@/lib/api';

// Define types for the data (optional but recommended)
interface GlucoseReading {
    _id: string;
    level: number;
    createdAt: string;
}
interface Medication {
    _id: string;
    taken: boolean;
}
interface Meal {
    _id: string;
    createdAt: string;
}

export function OverviewContent() {
    const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>(
        []
    );
    const [medications, setMedications] = useState<Medication[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);

    // Fetch Glucose
    useEffect(() => {
        api.getGlucoseReadings()
            .then((data) => setGlucoseReadings(data || []))
            .catch((err) => console.error('Failed to load readings:', err));
    }, []);

    // Fetch Medications
    useEffect(() => {
        api.getMedications()
            .then((data) => setMedications(data || []))
            .catch((err) => console.error('Failed to fetch medications:', err));
    }, []);

    // Fetch Meals
    useEffect(() => {
        api.getMeals()
            .then((data) => setMeals(data || []))
            .catch((err) => console.error('failed to fetch meals ', err));
    }, []);

    // --- CALCULATIONS ---
    // (All your existing calculation logic is moved here)

    // Glucose Calcs
    const weeklyAverageReading =
        glucoseReadings.length > 0
            ? Math.round(
                  glucoseReadings.reduce((sum, r) => sum + r.level, 0) /
                      glucoseReadings.length
              )
            : null;

    // Fixed date logic for lastWeekReadings
    const today = new Date();
    const lastWeekStartDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
    );

    const lastWeekReadings = glucoseReadings.filter((reading) => {
        const readingDate = new Date(reading.createdAt);
        return readingDate >= lastWeekStartDate;
    });

    const lastWeekAverage =
        lastWeekReadings.length > 0
            ? Math.round(
                  lastWeekReadings.reduce((sum, r) => sum + r.level, 0) /
                      lastWeekReadings.length
              )
            : null;

    const percentageChange =
        weeklyAverageReading && lastWeekAverage && lastWeekAverage !== 0
            ? Math.round(
                  ((weeklyAverageReading - lastWeekAverage) / lastWeekAverage) *
                      100
              )
            : null;

    // Medication Calcs
    const takenToday = medications.filter((med) => med.taken).length;
    const totalMedications = medications.length;
    const adherenceRate =
        totalMedications > 0
            ? Math.round((takenToday / totalMedications) * 100)
            : 0;

    // Meal Calcs (Fixed to get Monday of the current week)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + diffToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const mealsThisWeek = meals.filter(
        (meal) => new Date(meal.createdAt) >= startOfWeek
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {/* Current Glucose Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Glucose
                        </CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {glucoseReadings.length > 0
                                ? `${glucoseReadings[0].level} mg/dL`
                                : 'No data'}
                        </div>
                        <p className="text-xs text-gray-600">
                            {glucoseReadings.length === 0
                                ? 'No data available'
                                : glucoseReadings[0].level < 70
                                ? 'Low'
                                : glucoseReadings[0].level <= 140
                                ? 'Normal range'
                                : 'High'}
                        </p>
                    </CardContent>
                </Card>

                {/* Weekly Average Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Weekly Average
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {weeklyAverageReading !== null
                                ? `${weeklyAverageReading} mg/dL`
                                : 'No Data'}
                        </div>
                        {percentageChange !== null ? (
                            <p
                                className={`text-xs ${
                                    percentageChange < 0
                                        ? 'text-green-600' // Better if trend is down
                                        : 'text-red-600' // Worse if trend is up
                                }`}
                            >
                                {percentageChange > 0
                                    ? `↑ ${percentageChange}% from last week`
                                    : `↓ ${Math.abs(
                                          percentageChange
                                      )}% from last week`}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-600">
                                No previous data to compare
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Medications Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Medications
                        </CardTitle>
                        <Pill className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {medications.length > 0
                                ? `${adherenceRate}%`
                                : 'No Data'}
                        </div>
                        <p className="text-xs text-gray-600">Adherence rate</p>
                    </CardContent>
                </Card>

                {/* Meals Logged Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Meals Logged
                        </CardTitle>
                        <Apple className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                            {meals.length > 0
                                ? `${mealsThisWeek.length}`
                                : 'No Data'}
                        </div>
                        <p className="text-xs text-gray-600">This week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <GlucoseChart />
                <MedicationChart />
            </div>

            {/* Weekly Overview */}
            <WeeklyOverview />
        </div>
    );
}
