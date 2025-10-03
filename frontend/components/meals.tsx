'use client';

import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Apple,
    Utensils,
    TrendingUp,
    TrashIcon,
    Sparkles,
} from 'lucide-react';
import { estimateNutrition } from '@/lib/nutrition-db';

import { api } from '@/lib/api';

export interface Meal {
    _id: string;
    user: string;
    name: string;
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    carbs: number;
    calories: number;
    foods: string[];
    description?: string;
    createdAt: string;
}

export function Meals() {
    const [meals, setMeals] = useState<Meal[]>([]);

    const [newMeal, setNewMeal] = useState({
        name: '',
        type: '',
        carbs: '',
        calories: '',
        description: '',
        foods: '',
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMeals()
            .then((data) => {
                setMeals(data);
            })
            .catch((err) => console.error('Failed to load meals:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleAutoFillNutrition = () => {
        if (!newMeal.foods.trim()) return;

        const foodsArray = newMeal.foods
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f !== '');

        const { calories, carbs } = estimateNutrition(foodsArray);

        setNewMeal((prev) => ({
            ...prev,
            calories: calories.toString(),
            carbs: carbs.toString(),
        }));
    };

    const handleAddMeal = async () => {
        if (
            !newMeal.name ||
            !newMeal.type ||
            !newMeal.carbs ||
            !newMeal.calories
        )
            return;

        try {
            const foodsArray = newMeal.foods
                .split(',')
                .map((f) => f.trim())
                .filter((f) => f !== '');

            const createdMeal = await api.addMeal({
                name: newMeal.name,
                type: newMeal.type as Meal['type'],
                carbs: Number(newMeal.carbs),
                calories: Number(newMeal.calories),
                description: newMeal.description || undefined,
                foods: foodsArray,
            });

            setMeals((prevMeals) => [createdMeal, ...prevMeals]);

            setNewMeal({
                name: '',
                type: '',
                carbs: '',
                calories: '',
                description: '',
                foods: '',
            });

            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to add meal:', error);
            // optionally, show error UI here
        }
    };

    const handleDeleteMeal = async (id: string) => {
        try {
            await api.deleteMeal(id);
            setMeals((prev) => prev.filter((meal) => meal._id !== id));
        } catch (err) {
            console.error('Failed to delete meal:', err);
        }
    };

    const getMealTypeColor = (type: string) => {
        const colors = {
            breakfast: 'bg-yellow-100 text-yellow-800',
            lunch: 'bg-green-100 text-green-800',
            dinner: 'bg-blue-100 text-blue-800',
            snack: 'bg-purple-100 text-purple-800',
        };
        return (
            colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        );
    };

    const getMealTypeLabel = (type: string) => {
        const labels = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const mealsToday = meals.filter(
        (meal) => meal.createdAt === new Date().toISOString().split('T')[0]
    ).length;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Carbs
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {totalCarbs}g
                        </div>
                        <p className="text-xs text-gray-600">
                            Total carbohydrates
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Calories
                        </CardTitle>
                        <Apple className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalCalories}
                        </div>
                        <p className="text-xs text-gray-600">
                            Total calories consumed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Meals Logged
                        </CardTitle>
                        <Utensils className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {mealsToday}
                        </div>
                        <p className="text-xs text-gray-600">Today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Meals Log */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Meal Log</CardTitle>
                            <CardDescription>
                                Track your meals and monitor carbohydrate intake
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Log Meal
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showAddForm && (
                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meal-name">Meal Name</Label>
                                    <Input
                                        id="meal-name"
                                        placeholder="Enter meal name"
                                        value={newMeal.name}
                                        onChange={(e) =>
                                            setNewMeal({
                                                ...newMeal,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meal-type">Meal Type</Label>
                                    <Select
                                        value={newMeal.type}
                                        onValueChange={(value) =>
                                            setNewMeal({
                                                ...newMeal,
                                                type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select meal type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Breakfast">
                                                Breakfast
                                            </SelectItem>
                                            <SelectItem value="Lunch">
                                                Lunch
                                            </SelectItem>
                                            <SelectItem value="Dinner">
                                                Dinner
                                            </SelectItem>
                                            <SelectItem value="Snack">
                                                Snack
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foods">
                                    Foods (comma separated)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="foods"
                                        placeholder="e.g., Chicken, Rice, Broccoli"
                                        value={newMeal.foods}
                                        onChange={(e) =>
                                            setNewMeal({
                                                ...newMeal,
                                                foods: e.target.value,
                                            })
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAutoFillNutrition}
                                        disabled={!newMeal.foods.trim()}
                                        className="shrink-0 bg-transparent"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Auto-fill
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Enter foods and click Auto-fill to estimate
                                    nutrition, or enter manually below
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="carbs">
                                        Carbohydrates (g)
                                    </Label>
                                    <Input
                                        id="carbs"
                                        type="number"
                                        placeholder="Enter carbs"
                                        value={newMeal.carbs}
                                        onChange={(e) =>
                                            setNewMeal({
                                                ...newMeal,
                                                carbs: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="calories">Calories</Label>
                                    <Input
                                        id="calories"
                                        type="number"
                                        placeholder="Enter calories"
                                        value={newMeal.calories}
                                        onChange={(e) =>
                                            setNewMeal({
                                                ...newMeal,
                                                calories: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add meal description"
                                    value={newMeal.description}
                                    onChange={(e) =>
                                        setNewMeal({
                                            ...newMeal,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleAddMeal}
                                    disabled={
                                        !newMeal.name ||
                                        !newMeal.type ||
                                        !newMeal.carbs ||
                                        !newMeal.calories
                                    }
                                >
                                    Log Meal
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Meals List */}
                    <div className="space-y-3">
                        {meals.map((meal) => (
                            <div
                                key={meal._id}
                                className="p-3 sm:p-4 border rounded-lg bg-white"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-3">
                                        <Badge
                                            className={getMealTypeColor(
                                                meal.type
                                            )}
                                        >
                                            {getMealTypeLabel(meal.type)}
                                        </Badge>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-sm sm:text-base">
                                                {meal.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                {new Date(
                                                    meal.createdAt
                                                ).toLocaleDateString()}{' '}
                                                at{' '}
                                                {new Date(
                                                    meal.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 text-xs sm:text-sm">
                                        <span className="text-orange-600 font-medium">
                                            {meal.carbs}g carbs
                                        </span>
                                        <span className="text-green-600 font-medium">
                                            {meal.calories} cal
                                        </span>
                                    </div>
                                </div>

                                {meal.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                        {meal.description}
                                    </p>
                                )}

                                {meal.foods.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {meal.foods.map((food, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {food}
                                            </Badge>
                                        ))}
                                        <p>
                                            <Button
                                                variant="destructive"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    handleDeleteMeal(meal._id)
                                                }
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </Button>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
