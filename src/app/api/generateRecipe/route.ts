import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

export async function POST(request: Request) {
  const { ingredients, recipeName, filters, allergies } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    let prompt: string;
    
    if (ingredients) {
      prompt = `You are a helpful AI assistant that suggests recipes based on available ingredients and user preferences. Please suggest up to 9 classic recipes using the following ingredients: ${ingredients}. Follow these guidelines:
    
    1. Treat the provided ingredients as the main contents of a pantry.
    2. Prioritize quality and coherence of recipes over using all ingredients.
    3. Focus primarily on recipes that make the best use of the explicitly listed ingredients.
    4. You can assume basic pantry staples like oil, salt, pepper, and common spices are available, even if not listed.
    5. Do not suggest recipes that require major ingredients not listed (e.g., if pasta isn't listed, don't suggest pasta dishes).
    6. Only provide the names of the recipes, one per line, in markdown list format.
    7. Consider the following filters when suggesting recipes:
       - Cuisine: ${filters.cuisine}
       - Dietary Style: ${filters.dietaryStyle}
       - Meal Type: ${filters.mealType}
    8. Avoid recipes containing the following allergens or ingredients to avoid: ${allergies.join(', ')}
    
    Example format: (Only provide the names of the recipes, one per line, in markdown list format NO HELPING OR INTRODUCTORY TEXT WHATSOEVER)
    - Recipe 1 
    - Recipe 2 
    - Recipe 3 `;
    } else if (recipeName) {
      prompt = `You are a helpful AI assistant that provides detailed recipes. Please provide a detailed recipe for ${recipeName}. Include two main sections, a list of ingredients with measurements and step-by-step instructions. Use markdown formatting for headers, lists, and emphasis where appropriate. Consider the following preferences:
      
      - Cuisine: ${filters.cuisine}
      - Dietary Style: ${filters.dietaryStyle}
      - Meal Type: ${filters.mealType}
      - Avoid these allergens or ingredients: ${allergies.join(', ')}
      
      Include two main sections, a list of ingredients with measurements and step-by-step instructions.
      Adjust the recipe as needed to accommodate these preferences and restrictions.`;
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (ingredients) {
      const recipes = content.split('\n').filter(recipe => recipe.trim() !== '');
      return NextResponse.json({ recipes });
    } else {
      return NextResponse.json({ recipe: content });
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}