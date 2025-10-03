// Simple nutrition database for common foods (per 100g or standard serving)
export interface FoodNutrition {
    name: string;
    calories: number;
    carbs: number;
    serving: string;
}

export const nutritionDatabase: FoodNutrition[] = [
    // Proteins
    { name: 'chicken', calories: 165, carbs: 0, serving: '100g' },
    { name: 'beef', calories: 250, carbs: 0, serving: '100g' },
    { name: 'pork', calories: 242, carbs: 0, serving: '100g' },
    { name: 'salmon', calories: 208, carbs: 0, serving: '100g' },
    { name: 'tuna', calories: 132, carbs: 0, serving: '100g' },
    { name: 'egg', calories: 155, carbs: 1, serving: '2 eggs' },
    { name: 'tofu', calories: 76, carbs: 2, serving: '100g' },

    // Grains & Starches
    { name: 'rice', calories: 130, carbs: 28, serving: '100g cooked' },
    { name: 'pasta', calories: 131, carbs: 25, serving: '100g cooked' },
    { name: 'bread', calories: 265, carbs: 49, serving: '100g' },
    { name: 'quinoa', calories: 120, carbs: 21, serving: '100g cooked' },
    { name: 'oatmeal', calories: 71, carbs: 12, serving: '100g cooked' },
    { name: 'potato', calories: 77, carbs: 17, serving: '100g' },
    { name: 'sweet potato', calories: 86, carbs: 20, serving: '100g' },

    // Vegetables
    { name: 'broccoli', calories: 34, carbs: 7, serving: '100g' },
    { name: 'spinach', calories: 23, carbs: 4, serving: '100g' },
    { name: 'carrot', calories: 41, carbs: 10, serving: '100g' },
    { name: 'tomato', calories: 18, carbs: 4, serving: '100g' },
    { name: 'lettuce', calories: 15, carbs: 3, serving: '100g' },
    { name: 'cucumber', calories: 16, carbs: 4, serving: '100g' },
    { name: 'bell pepper', calories: 31, carbs: 6, serving: '100g' },

    // Fruits
    { name: 'apple', calories: 52, carbs: 14, serving: '1 medium' },
    { name: 'banana', calories: 89, carbs: 23, serving: '1 medium' },
    { name: 'orange', calories: 47, carbs: 12, serving: '1 medium' },
    { name: 'strawberry', calories: 32, carbs: 8, serving: '100g' },
    { name: 'blueberry', calories: 57, carbs: 14, serving: '100g' },
    { name: 'grapes', calories: 69, carbs: 18, serving: '100g' },

    // Dairy
    { name: 'milk', calories: 42, carbs: 5, serving: '100ml' },
    { name: 'yogurt', calories: 59, carbs: 5, serving: '100g' },
    { name: 'cheese', calories: 402, carbs: 1, serving: '100g' },

    // Snacks
    { name: 'almonds', calories: 579, carbs: 22, serving: '100g' },
    { name: 'peanuts', calories: 567, carbs: 16, serving: '100g' },
    { name: 'chips', calories: 536, carbs: 53, serving: '100g' },
    { name: 'cookie', calories: 502, carbs: 64, serving: '100g' },
    { name: 'chocolate', calories: 546, carbs: 61, serving: '100g' },
];

export function estimateNutrition(foodItems: string[]): {
    calories: number;
    carbs: number;
} {
    let totalCalories = 0;
    let totalCarbs = 0;
    let matchCount = 0;

    for (const item of foodItems) {
        const cleanItem = item.toLowerCase().trim();

        // Try to find exact or partial match
        const match = nutritionDatabase.find(
            (food) =>
                cleanItem.includes(food.name) || food.name.includes(cleanItem)
        );

        if (match) {
            totalCalories += match.calories;
            totalCarbs += match.carbs;
            matchCount++;
        }
    }

    // If no matches found, return reasonable defaults
    if (matchCount === 0) {
        return { calories: 300, carbs: 40 }; // Average meal estimate
    }

    return {
        calories: Math.round(totalCalories),
        carbs: Math.round(totalCarbs),
    };
}

export function searchFoodSuggestions(query: string): FoodNutrition[] {
    if (!query || query.length < 2) return [];

    const cleanQuery = query.toLowerCase().trim();
    return nutritionDatabase
        .filter((food) => food.name.includes(cleanQuery))
        .slice(0, 5);
}
