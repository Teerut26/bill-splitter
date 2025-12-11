import { z } from 'zod';

// Zod schemas for validating imported data

export const ParticipantSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ExpenseSchema = z.object({
  id: z.number(),
  title: z.string(),
  payerId: z.string(),
  amount: z.number(),
  involvedIds: z.array(z.number()),
  splitMode: z.enum(['equal', 'exact']),
  customSplits: z.record(z.string(), z.number()),
});

export const SessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  participants: z.array(ParticipantSchema),
  expenses: z.array(ExpenseSchema),
});

export const TripExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  tripName: z.string(),
  sessions: z.array(SessionSchema),
});

export type TripExport = z.infer<typeof TripExportSchema>;
