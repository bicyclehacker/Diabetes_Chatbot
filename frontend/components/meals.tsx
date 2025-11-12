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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    Pencil, // 1. Added Pencil icon for Edit
} from 'lucide-react';
import { estimateNutrition } from '@/lib/nutrition-db';

import { api } from '@/lib/api';
import { toast } from 'sonner';

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

// 2. This state type will be used for the Edit form
type EditableMealState = {
    _id: string;
    name: string;
    type: Meal['type'];
    carbs: string;
    calories: string;
    foods: string;
    description: string;
};

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

    // 3. State for dialogs and editing
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<EditableMealState | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isEstimating, setIsEstimating] = useState(false);

    useEffect(() => {
        api.getMeals()
            .then((data) => {
                setMeals(data);
            })
            .catch((err) => console.error('Failed to load meals:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleAutoFillNutrition = async (target: 'new' | 'edit' = 'new') => {
        const foodsString =
            target === 'new' ? newMeal.foods : editingMeal?.foods || '';
        if (!foodsString.trim()) return;

        setIsEstimating(true);
        try {
            // 1. Call the API (no change here)
            // The response will now contain { name, calories, carbs }
            const { name, calories, carbs } = await api.getNutritionEstimate(
                foodsString
            );

            // 2. Update the correct form state
            if (target === 'new') {
                setNewMeal((prev) => ({
                    ...prev,
                    name: name,
                    calories: String(calories),
                    carbs: String(carbs),
                }));
            } else {
                setEditingMeal((prev) =>
                    prev
                        ? {
                              ...prev,
                              name: name,
                              calories: String(calories),
                              carbs: String(carbs),
                          }
                        : null
                );
            }
        } catch (error) {
            toast.error('Failed to estimate nutrition');
        } finally {
            setIsEstimating(false);
        }
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

            // Reset form
            setNewMeal({
                name: '',
                type: '',
                carbs: '',
                calories: '',
                description: '',
                foods: '',
            });

            setIsAddOpen(false);

            toast.success('Meal added successfully');
        } catch (error) {
            console.error('Failed to add meal:', error);
        }
    };

    // 4. Handler to open and populate the Edit dialog
    const handleOpenEdit = (meal: Meal) => {
        setEditingMeal({
            _id: meal._id,
            name: meal.name,
            type: meal.type,
            carbs: String(meal.carbs),
            calories: String(meal.calories),
            description: meal.description || '',
            foods: meal.foods.join(', '), // Convert array back to string
        });
        setIsEditOpen(true);
    };

    // 5. Handler to submit the Edit form
    const handleUpdateMeal = async () => {
        if (!editingMeal) return;

        try {
            const foodsArray = editingMeal.foods
                .split(',')
                .map((f) => f.trim())
                .filter((f) => f !== '');

            const updatedMeal = await api.updateMeal(editingMeal._id, {
                name: editingMeal.name,
                type: editingMeal.type,
                carbs: Number(editingMeal.carbs),
                calories: Number(editingMeal.calories),
                description: editingMeal.description || undefined,
                foods: foodsArray,
            });

            // Update the meal in the main list
            setMeals((prev) =>
                prev.map((m) => (m._id === updatedMeal._id ? updatedMeal : m))
            );

            setIsEditOpen(false); // Close dialog
            setEditingMeal(null);
        } catch (error) {
            console.error('Failed to update meal:', error);
        }
    };

    const handleDeleteMeal = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this meal?')) {
            return;
        }
        try {
            await api.deleteMeal(id);
            setMeals((prev) => prev.filter((meal) => meal._id !== id));
        } catch (err) {
            console.error('Failed to delete meal:', err);
        }
    };

    const getMealTypeColor = (type: string) => {
        const colors = {
            Breakfast: 'bg-yellow-100 text-yellow-800',
            Lunch: 'bg-green-100 text-green-800',
            Dinner: 'bg-blue-100 text-blue-800',
            Snack: 'bg-purple-100 text-purple-800',
        };
        return (
            colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        );
    };

    // (This function wasn't used, but I kept it just in case)
    const getMealTypeLabel = (type: string) => {
        const labels = {
            Breakfast: 'Breakfast',
            Lunch: 'Lunch',
            Dinner: 'Dinner',
            Snack: 'Snack',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    // 6. Fixed bug in mealsToday calculation
    const todayStr = new Date().toISOString().split('T')[0];
    const mealsToday = meals.filter(
        (meal) =>
            new Date(meal.createdAt).toISOString().split('T')[0] === todayStr
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

                        {/* 7. "Add Meal" button now opens a Dialog */}
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Log Meal
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Log a New Meal</DialogTitle>
                                </DialogHeader>
                                {/* "Add" form content moved here */}
                                <div className="p-1 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="meal-name">
                                                Meal Name
                                            </Label>
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
                                            <Label htmlFor="meal-type">
                                                Meal Type
                                            </Label>
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
                                                placeholder="e.g. Rice, Broccoli, Nuts"
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
                                                onClick={() =>
                                                    handleAutoFillNutrition(
                                                        'new'
                                                    )
                                                }
                                                disabled={
                                                    !newMeal.foods.trim() ||
                                                    isEstimating
                                                }
                                                className="shrink-0 bg-transparent"
                                            >
                                                {isEstimating ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                                ) : (
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                )}
                                                {isEstimating
                                                    ? 'Estimating...'
                                                    : 'Auto-fill'}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Enter foods and click Auto-fill to
                                            estimate nutrition, or enter
                                            manually below
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
                                            <Label htmlFor="calories">
                                                Calories
                                            </Label>
                                            <Input
                                                id="calories"
                                                type="number"
                                                placeholder="Enter calories"
                                                value={newMeal.calories}
                                                onChange={(e) =>
                                                    setNewMeal({
                                                        ...newMeal,
                                                        calories:
                                                            e.target.value,
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
                                            onClick={() => setIsAddOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* 8. "Edit Meal" Dialog (hidden by default) */}
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Meal</DialogTitle>
                                </DialogHeader>
                                {/* "Edit" form content, bound to editingMeal state */}
                                {editingMeal && (
                                    <div className="p-1 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-meal-name">
                                                    Meal Name
                                                </Label>
                                                <Input
                                                    id="edit-meal-name"
                                                    value={editingMeal.name}
                                                    onChange={(e) =>
                                                        setEditingMeal({
                                                            ...editingMeal,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-meal-type">
                                                    Meal Type
                                                </Label>
                                                <Select
                                                    value={editingMeal.type}
                                                    onValueChange={(value) =>
                                                        setEditingMeal({
                                                            ...editingMeal,
                                                            type: value as Meal['type'],
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
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
                                            <Label htmlFor="edit-foods">
                                                Foods (comma separated)
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="edit-foods"
                                                    value={editingMeal.foods}
                                                    onChange={(e) =>
                                                        setEditingMeal({
                                                            ...editingMeal,
                                                            foods: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleAutoFillNutrition(
                                                            'edit'
                                                        )
                                                    }
                                                    disabled={
                                                        !editingMeal.foods.trim() ||
                                                        isEstimating
                                                    }
                                                    className="shrink-0 bg-transparent"
                                                >
                                                    {isEstimating ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                                    ) : (
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                    )}
                                                    {isEstimating
                                                        ? 'Estimating...'
                                                        : 'Auto-fill'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-carbs">
                                                    Carbohydrates (g)
                                                </Label>
                                                <Input
                                                    id="edit-carbs"
                                                    type="number"
                                                    value={editingMeal.carbs}
                                                    onChange={(e) =>
                                                        setEditingMeal({
                                                            ...editingMeal,
                                                            carbs: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-calories">
                                                    Calories
                                                </Label>
                                                <Input
                                                    id="edit-calories"
                                                    type="number"
                                                    value={editingMeal.calories}
                                                    onChange={(e) =>
                                                        setEditingMeal({
                                                            ...editingMeal,
                                                            calories:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="edit-description">
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                id="edit-description"
                                                value={editingMeal.description}
                                                onChange={(e) =>
                                                    setEditingMeal({
                                                        ...editingMeal,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleUpdateMeal}>
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setIsEditOpen(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 9. Removed the old showAddForm wrapper */}

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
                                            {meal.type}
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
                                    {/* 10. Moved buttons to this flex container */}
                                    <div className="flex items-center space-x-4">
                                        <span className="text-orange-600 font-medium text-xs sm:text-sm">
                                            {meal.carbs}g carbs
                                        </span>
                                        <span className="text-green-600 font-medium text-xs sm:text-sm">
                                            {meal.calories} cal
                                        </span>
                                        <div className="flex space-x-0.5">
                                            <Button
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    handleOpenEdit(meal)
                                                }
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    handleDeleteMeal(meal._id)
                                                }
                                            >
                                                <TrashIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {meal.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                        {meal.description}
                                    </p>
                                )}

                                {/* 11. Fixed food badges to split properly */}
                                {meal.foods.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {meal.foods
                                            .flatMap((food) => food.split(','))
                                            .map((food, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {food.trim()}
                                                </Badge>
                                            ))}
                                        {/* 12. Removed delete button from here */}
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
