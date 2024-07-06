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
    document.body.className = 'bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 min-h-screen';
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
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <ChefHat className="mx-auto h-24 w-24 text-teal-500" />
        <h1 className="mt-6 text-5xl font-extrabold text-gray-900 sm:text-6xl sm:tracking-tight lg:text-7xl">
          Pantry <span className="text-teal-500">Pal</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 sm:text-2xl">
          Transform your ingredients into culinary masterpieces
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="ingredients" className="text-lg">
            <Utensils className="mr-2 h-5 w-5" />
            Ingredients
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="recipe" className="text-lg">
            <Book className="mr-2 h-5 w-5" />
            Recipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients">
          <Card className="mb-12 overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 bg-white bg-opacity-90 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleAddIngredient}
                      placeholder="List your pantry ingredients one at a time"
                      className="text-lg py-6 pl-12 border-2 border-teal-200 focus:border-teal-500 rounded-lg"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <CornerDownLeft className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-2 text-base bg-teal-100 text-teal-800">
                        {ingredient}
                        <button 
                          type="button" 
                          onClick={() => removeIngredient(index)} 
                          className="ml-2 text-teal-600 hover:text-teal-800"
                        >
                          <X size={16} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleDiscoverRecipes}
                  className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-semibold py-6 text-xl rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  disabled={loading || ingredients.length === 0}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-6 w-6" />
                  )}
                  Discover Recipes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recipe suggestions using your ingredients:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-teal-500 flex-shrink-0" />
                        <ReactMarkdown>{recipe.name}</ReactMarkdown>
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
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
              >
                <Card className="shadow-2xl bg-white">
                  <CardHeader className="p-8 bg-gradient-to-r from-teal-100 to-cyan-100">
                    <ReactMarkdown className="text-3xl font-bold text-gray-800">{selectedRecipe.name}</ReactMarkdown>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
                        <Utensils className="mr-2 h-6 w-6 text-teal-500" />
                        Ingredients
                      </h3>
                      <ul className="space-y-2 text-gray-600 text-lg">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={ingredient}>
                            <ReactMarkdown>{ingredient}</ReactMarkdown>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
                        <ChefHat className="mr-2 h-6 w-6 text-teal-500" />
                        Instructions
                      </h3>
                      <ol className="space-y-3 text-gray-600 text-lg">
                        {selectedRecipe.instructions.map((step, index) => (
                          <li key={step}>
                            <ReactMarkdown>{step}</ReactMarkdown>
                          </li>
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
