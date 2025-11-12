const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, mealController.createMeal);
router.get('/', protect, mealController.getMeals);
router.put('/:id', protect, mealController.updateMeal);
router.delete('/:id', protect, mealController.deleteMeal);

router.post('/estimate-nutrition', protect, mealController.estimateNutrition);

module.exports = router;
