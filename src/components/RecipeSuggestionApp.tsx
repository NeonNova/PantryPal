"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Loader2, ChefHat, Utensils, Sparkles, X, Search, Book, CornerDownLeft, Filter, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import ReactMarkdown from 'react-markdown'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
}

interface Filters {
  cuisine: string;
  dietaryStyle: string;
  mealType: string;
}

const commonIngredients = {
    Vegetables: ['Tomatoes', 'Onions', 'Garlic', 'Potatoes', 'Carrots', 'Spinach', 'Bell Peppers', 'Cucumbers', 'Mushrooms', 'Zucchini', 'Broccoli', 'Green Beans', 'Celery', 'Asparagus', 'Cabbage', 'Brussels Sprouts', 'Kale', 'Peas', 'Artichokes', 'Eggplant', 'Lettuce', 'Radishes', 'Scallions', 'Sweet Potatoes', 'Corn', 'Okra', 'Bitter Gourd', 'Fenugreek Leaves'],
    Fruits: ['Apples', 'Bananas', 'Oranges', 'Lemons', 'Strawberries', 'Blueberries', 'Raspberries', 'Avocado', 'Grapes', 'Mangoes', 'Pineapple', 'Peaches', 'Plums', 'Kiwi', 'Pears', 'Cherries', 'Watermelon', 'Pomegranate', 'Cantaloupe', 'Guava', 'Lychee'],
    Proteins: ['Chicken', 'Beef', 'Pork', 'Eggs', 'Salmon', 'Shrimp', 'Tofu', 'Turkey', 'Lamb', 'Sardines', 'Paneer', 'Cottage Cheese', 'Yogurt', 'Black Beans', 'Kidney Beans', 'Cannellini Beans', 'Chickpeas', 'Lentils', 'Quinoa', 'Tempeh', 'Venison', 'Duck', 'Crab', 'Lobster'],
    Grains: ['Rice', 'Pasta', 'Bread', 'Quinoa', 'Oats', 'Barley', 'Cornmeal', 'Couscous', 'Farro', 'Bulgur', 'Millet', 'Polenta', 'Rye', 'Chapati Flour', 'Semolina'],
    Dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Sour Cream', 'Paneer', 'Mozarella', 'Cheddar', 'Parmesan', 'Sliced Cheese', 'Cottage Cheese', 'Cream Cheese', 'Ricotta', 'Goat Cheese', 'Mascarpone'],
    Spices: ['Salt', 'Pepper', 'Cumin', 'Paprika', 'Cinnamon', 'Oregano', 'Basil', 'Thyme', 'Chili Powder', 'Coriander', 'Turmeric', 'Ginger', 'Rosemary', 'Nutmeg', 'Cardamom', 'Cloves', 'Bay Leaves', 'Allspice', 'Fennel Seeds', 'Saffron', 'Mustard Seeds', 'Asafoetida'],
    Pantry: ['Olive Oil', 'Vegetable Oil', 'Coconut Oil', 'Sesame Oil', 'Avocado Oil', 'Mustard Oil', 'Balsamic Vinegar', 'Red Wine Vinegar', 'Apple Cider Vinegar', 'Soy Sauce', 'Fish Sauce', 'Worcestershire Sauce', 'All-Purpose Flour', 'Whole Wheat Flour', 'White Sugar', 'Brown Sugar', 'Honey', 'Maple Syrup', 'Almonds', 'Walnuts', 'Pecans', 'Flaxseeds', 'Chia Seeds', 'Sunflower Seeds', 'Raisins', 'Cranberries', 'Baking Powder', 'Baking Soda', 'Cocoa Powder', 'Vanilla Extract', 'Cornstarch', 'Tamarind Paste', 'Garam Masala']
  };
  
  
  
const cuisines = ['Any', 'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'French', 'Mediterranean', 'American'];
const dietaryStyles = ['Any', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb'];
const mealTypes = ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];

const RecipeSuggestionApp: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [filters, setFilters] = useState<Filters>({ cuisine: 'Any', dietaryStyle: 'Any', mealType: 'Any' });
  const [allergies, setAllergies] = useState<string[]>([]);

  useEffect(() => {
    document.body.className = 'bg-black min-h-screen font-sans';
  }, []);

  const handleAddIngredient = (ingredient: string) => {
    setIngredients(prevIngredients => {
      return prevIngredients.includes(ingredient) 
        ? prevIngredients 
        : [...prevIngredients, ingredient];
    });
    setInputValue('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddIngredient(inputValue.trim());
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleDiscoverRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ingredients: ingredients.join(', '),
          filters,
          allergies
        }),
      });
      const data = await response.json();
      const recipes = data.recipes.map((recipe: string, index: number) => ({
        id: index + 1,
        name: recipe.trim(),
      }));
      setSuggestions(recipes);
      setActiveTab('suggestions');
    } catch (error) {
      console.error('Error generating recipes:', error);
    }
    setLoading(false);
  };

  const handleRecipeClick = async (recipe: { id: number; name: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recipeName: recipe.name,
          filters,
          allergies
        }),
      });
      const data = await response.json();
      const fullRecipe = parseRecipe(data.recipe);
      setSelectedRecipe({
        id: recipe.id,
        name: recipe.name,
        ingredients: fullRecipe.ingredients,
        instructions: fullRecipe.instructions,
      });
      setActiveTab('recipe');
    } catch (error) {
      console.error('Error generating full recipe:', error);
    }
    setLoading(false);
  };

  const parseRecipe = (recipeText: string) => {
    const lines = recipeText.split('\n');
    const ingredients: string[] = [];
    const instructions: string[] = [];
    let parsingIngredients = false;
    let parsingInstructions = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('ingredients:')) {
        parsingIngredients = true;
        parsingInstructions = false;
        continue;
      }
      if (line.toLowerCase().includes('instructions:') || line.toLowerCase().includes('directions:')) {
        parsingIngredients = false;
        parsingInstructions = true;
        continue;
      }
      if (parsingIngredients && line.trim()) {
        ingredients.push(line.trim().replace(/^\*\s*/, ''));
      }
      if (parsingInstructions && line.trim()) {
        instructions.push(line.trim().replace(/^\d+\.\s*/, ''));
      }
    }

    return { ingredients, instructions };
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-5xl text-pink-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 sm:mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChefHat className="mx-auto h-12 w-12 sm:h-24 sm:w-24 text-pink-300" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-2 sm:mt-6 text-3xl sm:text-6xl font-bold text-pink-100 sm:tracking-tight"
        >
          Pantry<span className="text-pink-300">Pal</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-2 sm:mt-4 max-w-2xl font-medium mx-auto text-base sm:text-xl text-pink-200"
        >
          Get recipe ideas using stuff you already have  in your pantry!
        </motion.p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-black rounded-lg p-1">
          {['ingredients', 'suggestions', 'recipe'].map((tab, index) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`text-xs sm:text-lg font-medium transition-all duration-300 
                ${activeTab === tab 
                  ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-indigo-500 font-medium shadow-lg' 
                  : 'text-pink-200 font-medium hover:bg-black'}`}
            >
              <motion.div
                initial={false}
                animate={{ 
                  scale: activeTab === tab ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center h-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center"
                >
                  {tab === 'ingredients' && <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />}
                  {tab === 'suggestions' && <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />}
                  {tab === 'recipe' && <Book className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.div>
              </motion.div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ingredients">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 ">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Enter the ingredients in your pantry "
                        className="text-lg py-4 pl-12 bg-black border-2 border-pink-300 focus:border-pink-500 rounded-lg text-pink-100 placeholder-pink-300"
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-300 h-5 w-5" />
                      <CornerDownLeft className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-300 h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      <AnimatePresence>
                        {ingredients.map((ingredient, index) => (
                          <motion.div
                            key={ingredient}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="default" className="px-2 py-1 text-sm bg-pink-400 hover:bg-white text-white hover:text-black">
                              {ingredient}
                              <button 
                                type="button" 
                                onClick={() => removeIngredient(index)} 
                                className="ml-2 text-white border-pink-300 hover:text-pink-600 "
                              >
                                <X size={16} />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="common-ingredients">
                      <AccordionTrigger className="text-lg font-semibold text-pink-100">
                        Common Ingredients
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {Object.entries(commonIngredients).map(([category, items]) => (
                            <div key={category}>
                              <h4 className="text-sm font-medium text-pink-200 mb-2">{category}</h4>
                              <div className="flex flex-wrap gap-2">
                                {items.map((item) => (
                                  <Badge
                                    key={item}
                                    variant="default"
                                    className={`cursor-pointer ${
                                      ingredients.includes(item) ? 'bg-pink-400 hover:bg-white text-white hover:text-black' : 'hover:bg-white bg-pink-400 hover:text-black text-white'
                                    }`}
                                    onClick={() => handleAddIngredient(item)}
                                  >
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="filters">
                    <AccordionTrigger className="text-lg font-semibold text-pink-100">
                        Filters
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Select
                            value={filters.cuisine || "Any"}
                            onValueChange={(value) => setFilters({ ...filters, cuisine: value })}
                        >
                            <SelectTrigger className="bg-black border-pink-300">
                            <SelectValue className="bg-black text-white">
                                {filters.cuisine === "Any" ? "Pick a Cuisine" : filters.cuisine}
                            </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-pink-600  text-white">
                            {cuisines.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine} className="bg-black text-white hover:bg-black">
                                {cuisine}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.dietaryStyle || "Any"}
                            onValueChange={(value) => setFilters({ ...filters, dietaryStyle: value })}
                        >
                            <SelectTrigger className="bg-black border-pink-300">
                            <SelectValue className="bg-black text-white">
                                {filters.dietaryStyle === "Any" ? "Pick a Dietary Style" : filters.dietaryStyle}
                            </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-pink-600 text-white">
                            {dietaryStyles.map((style) => (
                                <SelectItem key={style} value={style} className="bg-black text-white hover:bg-black">
                                {style}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.mealType || "Any"}
                            onValueChange={(value) => setFilters({ ...filters, mealType: value })}
                        >
                            <SelectTrigger className="bg-black border-pink-300">
                            <SelectValue className="bg-black text-white">
                                {filters.mealType === "Any" ? "Pick a Meal Type" : filters.mealType}
                            </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-pink-600 text-white">
                            {mealTypes.map((type) => (
                                <SelectItem key={type} value={type} className="bg-black text-white hover:bg-black">
                                {type}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                    </AccordionContent>
                    </AccordionItem>


                    <AccordionItem value="allergies">
                      <AccordionTrigger className="text-lg font-semibold text-pink-100">
                        Allergies / Ingredients to Avoid
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-4">
                          {['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'].map((allergy) => (
                            <div key={allergy} className="flex items-center space-x-2">
                              <Checkbox
                                id={allergy}
                                checked={allergies.includes(allergy)}
                                onCheckedChange={(checked) => {
                                  setAllergies(
                                    checked
                                      ? [...allergies, allergy]
                                      : allergies.filter((a) => a !== allergy)
                                  );
                                }}
                              />
                              <label
                                htmlFor={allergy}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {allergy}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button 
                    onClick={handleDiscoverRecipes}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                    disabled={loading || ingredients.length === 0}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    Discover Recipes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="suggestions">
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-pink-100 mb-4">Recipe suggestions based on your ingredients and preferences:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 cursor-pointer border border-pink-300 hover:border-pink-500"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-pink-300 flex-shrink-0" />
                        <ReactMarkdown className="text-base text-pink-100">{recipe.name}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="recipe">
          <AnimatePresence>
            {selectedRecipe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-2xl bg-blACK border border-pink-300">
                  <CardHeader className="p-6 bg-gradient-to-r from-pink-400 to-pink-600">
                    <ReactMarkdown className="text-2xl font-bold text-white break-words">{selectedRecipe.name}</ReactMarkdown>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-pink-100 flex items-center">
                        <Utensils className="mr-2 h-5 w-5 text-pink-300" />
                        Ingredients
                      </h3>
                      <ul className="space-y-2 text-pink-200 text-base">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start"
                          >
                            <span className="mr-2 text-pink-300">•</span>
                            <ReactMarkdown className="break-words">{ingredient}</ReactMarkdown>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-pink-100 flex items-center">
                        <ChefHat className="mr-2 h-5 w-5 text-pink-300" />
                        Instructions
                      </h3>
                      <ol className="space-y-3 text-pink-200 text-base list-decimal list-outside ml-6">
                        {selectedRecipe.instructions.map((step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="pl-2"
                          >
                            <ReactMarkdown className="break-words">{step}</ReactMarkdown>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecipeSuggestionApp;