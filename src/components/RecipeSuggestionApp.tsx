"use client"

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Loader2, ChefHat, Utensils, Sparkles, X, Search, Book, CornerDownLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from 'react-markdown'

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
}

const RecipeSuggestionApp: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

  useEffect(() => {
    document.body.className = 'bg-gray-900 min-h-screen font-sans';
  }, []);

  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      setIngredients(prevIngredients => {
        const newIngredient = inputValue.trim();
        return prevIngredients.includes(newIngredient) 
          ? prevIngredients 
          : [...prevIngredients, newIngredient];
      });
      setInputValue('');
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
        body: JSON.stringify({ ingredients: ingredients.join(', ') }),
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
        body: JSON.stringify({ recipeName: recipe.name }),
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
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-5xl text-pink-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChefHat className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-pink-300" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 sm:mt-6 text-4xl sm:text-6xl font-bold text-pink-100 sm:tracking-tight lg:text-7xl"
        >
          Pantry<span className="text-pink-300">Pal</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-2 sm:mt-4 max-w-2xl font-medium mx-auto text-lg sm:text-xl text-pink-200"
        >
          Transform your ingredients into culinary masterpieces
        </motion.p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 bg-gray-800 rounded-lg p-1">
          {['ingredients', 'suggestions', 'recipe'].map((tab, index) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={`text-sm sm:text-lg font-medium transition-all duration-300 
                ${activeTab === tab 
                  ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-indigo-500 font-medium shadow-lg' 
                  : 'text-pink-200 font-medium hover:bg-gray-700'}`}
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
                  {tab === 'ingredients' && <Utensils className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  {tab === 'suggestions' && <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  {tab === 'recipe' && <Book className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
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
            <Card className="mb-6 sm:mb-12 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 bg-gray-800 bg-opacity-50 backdrop-blur-lg">
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleAddIngredient}
                        placeholder="List your pantry ingredients"
                        className="text-base sm:text-lg py-4 sm:py-6 pl-10 sm:pl-12 bg-gray-700 border-2 border-pink-300 focus:border-pink-500 rounded-lg text-pink-100 placeholder-pink-300"
                      />
                      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-pink-300 h-4 w-4 sm:h-5 sm:w-5" />
                      <CornerDownLeft className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-pink-300 h-4 w-4 sm:h-5 sm:w-5" />
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
                            <Badge variant="secondary" className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base bg-pink-200 text-gray-800">
                              {ingredient}
                              <button 
                                type="button" 
                                onClick={() => removeIngredient(index)} 
                                className="ml-1 sm:ml-2 text-gray-600 hover:text-gray-800"
                              >
                                <X size={14} />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDiscoverRecipes}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-semibold py-4 sm:py-6 text-lg sm:text-xl rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                    disabled={loading || ingredients.length === 0}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
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
                <h3 className="text-lg sm:text-xl font-semibold text-pink-100 mb-2 sm:mb-4">Recipe suggestions using your ingredients:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {suggestions.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 sm:p-4 cursor-pointer border border-pink-300 hover:border-pink-500"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-center">
                        <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-300 flex-shrink-0" />
                        <ReactMarkdown className="text-sm sm:text-base text-pink-100">{recipe.name}</ReactMarkdown>
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
                <Card className="shadow-2xl bg-gray-800 border border-pink-300">
                  <CardHeader className="p-4 sm:p-8 bg-gradient-to-r from-pink-400 to-pink-600">
                    <ReactMarkdown className="text-xl sm:text-3xl font-bold text-white break-words">{selectedRecipe.name}</ReactMarkdown>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-pink-100 flex items-center">
                        <Utensils className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-pink-300" />
                        Ingredients
                      </h3>
                      <ul className="space-y-2 text-pink-200 text-base sm:text-lg">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <motion.li
                            key={ingredient}
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
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-pink-100 flex items-center">
                        <ChefHat className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-pink-300" />
                        Instructions
                      </h3>
                      <ol className="space-y-3 text-pink-200 text-base sm:text-lg list-decimal list-inside">
                        {selectedRecipe.instructions.map((step, index) => (
                          <motion.li
                            key={step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="pl-2"
                          >
                            <ReactMarkdown className="inline break-words">{step}</ReactMarkdown>
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