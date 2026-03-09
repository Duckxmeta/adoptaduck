'use server';
/**
 * @fileOverview A Genkit flow to generate unique personality traits and a compelling backstory for a new duck resident.
 *
 * - generateDuckPersonalityAndLore - A function that handles the generation process.
 * - GenerateDuckPersonalityAndLoreInput - The input type for the generateDuckPersonalityAndLore function.
 * - GenerateDuckPersonalityAndLoreOutput - The return type for the generateDuckPersonalityAndLore function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDuckPersonalityAndLoreInputSchema = z.object({
  name: z.string().describe("The duck's name."),
  breed: z.string().describe("The duck's breed."),
  sex: z.enum(['male', 'female']).describe("The duck's sex."),
});
export type GenerateDuckPersonalityAndLoreInput = z.infer<typeof GenerateDuckPersonalityAndLoreInputSchema>;

const GenerateDuckPersonalityAndLoreOutputSchema = z.object({
  personalityTraits: z
    .array(z.string())
    .describe('A list of unique personality traits for the duck.'),
  backstory: z.string().describe('A compelling backstory for the duck.'),
});
export type GenerateDuckPersonalityAndLoreOutput = z.infer<typeof GenerateDuckPersonalityAndLoreOutputSchema>;

export async function generateDuckPersonalityAndLore(
  input: GenerateDuckPersonalityAndLoreInput
): Promise<GenerateDuckPersonalityAndLoreOutput> {
  return generateDuckPersonalityAndLoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDuckPersonalityAndLorePrompt',
  input: { schema: GenerateDuckPersonalityAndLoreInputSchema },
  output: { schema: GenerateDuckPersonalityAndLoreOutputSchema },
  prompt: `You are an expert duck lore master and personality profiler.

Generate unique personality traits and a compelling backstory for a new duck resident based on the provided details.

Make sure the backstory is engaging and fits the duck's characteristics, encouraging virtual adoption.

Duck Details:
Name: {{{name}}}
Breed: {{{breed}}}
Sex: {{{sex}}}`,
});

const generateDuckPersonalityAndLoreFlow = ai.defineFlow(
  {
    name: 'generateDuckPersonalityAndLoreFlow',
    inputSchema: GenerateDuckPersonalityAndLoreInputSchema,
    outputSchema: GenerateDuckPersonalityAndLoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
