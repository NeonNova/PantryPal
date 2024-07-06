import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

export async function POST(request: Request) {
  const { ingredients, recipeName } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    let prompt: string;
if (ingredients) {
  prompt = `You are a helpful AI assistant that suggests recipes based on available ingredients. Please suggest up to 9 classic recipes using the following ingredients: ${ingredients}. Only provide the names of the recipes, one per line. Focus on suggesting recipes that make the best use of these ingredients, prioritizing quality and coherence over using all ingredients. List them one per line in markdown format.`;
} else if (recipeName) {
  prompt = `You are a helpful AI assistant that provides detailed recipes. Please provide a detailed recipe for ${recipeName}. Include a list of ingredients with measurements and step-by-step instructions. Make sure to use markdown formatting for`;
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