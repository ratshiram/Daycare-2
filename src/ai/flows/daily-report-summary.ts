// src/ai/flows/daily-report-summary.ts
'use server';

/**
 * @fileOverview Generates a personalized daily report summary for a child.
 *
 * - generateDailyReportSummary - A function that generates the daily report summary.
 * - DailyReportSummaryInput - The input type for the generateDailyReportSummary function.
 * - DailyReportSummaryOutput - The return type for the generateDailyReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyReportSummaryInputSchema = z.object({
  childName: z.string().describe('The name of the child.'),
  mood: z.string().describe('The mood of the child for the day.'),
  meals: z
    .object({
      breakfast: z.string().optional(),
      lunch: z.string().optional(),
      snack_am: z.string().optional(),
      snack_pm: z.string().optional(),
    })
    .describe('Details of meals consumed by the child.'),
  naps: z
    .array(
      z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
    )
    .describe('Array of nap objects, each with start and end times.'),
  activities: z.string().describe('The activities the child participated in.'),
  toileting_diapers: z.string().describe('Details of toileting and diaper changes.'),
  notes_for_parents: z.string().describe('Additional notes for the parents.'),
});
export type DailyReportSummaryInput = z.infer<typeof DailyReportSummaryInputSchema>;

const DailyReportSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the daily report.'),
});
export type DailyReportSummaryOutput = z.infer<typeof DailyReportSummaryOutputSchema>;

export async function generateDailyReportSummary(
  input: DailyReportSummaryInput
): Promise<DailyReportSummaryOutput> {
  return dailyReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyReportSummaryPrompt',
  input: {schema: DailyReportSummaryInputSchema},
  output: {schema: DailyReportSummaryOutputSchema},
  prompt: `You are an expert daycare teacher summarizing the day for parents.

  Create a personalized daily report summary for {{childName}}, including mood, meals, naps, activities, toileting/diapers, and any notes for the parents.

  Here are the details:
  - Child's Name: {{childName}}
  - Mood: {{mood}}
  - Meals: Breakfast - {{meals.breakfast}}, Lunch - {{meals.lunch}}, Snack AM - {{meals.snack_am}}, Snack PM - {{meals.snack_pm}}
  - Naps: {{#each naps}}Start - {{start}}, End - {{end}}{{/each}}
  - Activities: {{activities}}
  - Toileting/Diapers: {{toileting_diapers}}
  - Notes for Parents: {{notes_for_parents}}

  Summary:`,
});

const dailyReportSummaryFlow = ai.defineFlow(
  {
    name: 'dailyReportSummaryFlow',
    inputSchema: DailyReportSummaryInputSchema,
    outputSchema: DailyReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
