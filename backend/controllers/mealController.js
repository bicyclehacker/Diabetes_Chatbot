const Meal = require('../models/Meals');

exports.createMeal = async (req, res) => {
    try {
        const meal = await Meal.create({ ...req.body, user: req.user.id });
        res.status(201).json(meal);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to create meal',
            error: err.message,
        });
    }
};

exports.getMeals = async (req, res) => {
    try {
        const meals = await Meal.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json(meals);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch meals',
            error: err.message,
        });
    }
};

exports.updateMeal = async (req, res) => {
    try {
        const meal = await Meal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!meal) return res.status(404).json({ message: 'Meal not found' });
        res.json(meal);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update meal',
            error: err.message,
        });
    }
};

exports.deleteMeal = async (req, res) => {
    try {
        const meal = await Meal.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!meal) return res.status(404).json({ message: 'Meal not found' });
        res.json({ message: 'Meal deleted' });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete meal',
            error: err.message,
        });
    }
};
