// submit-move-request/validation.ts
// Zod schema for incoming customer move requests. Mirrors the existing
// validate-move-request rules but is the single source of truth for the
// new server-mediated submission path.
//
// Updated: commercial moves accept a commercialProfile { premisesType, scale }
// in place of the legacy single propertySize string. propertySize is
// required for domestic and international moves; commercialProfile is
// required for commercial moves.

import { z } from "https://esm.sh/zod@3.23.8";

const addressSchema = z.object({
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional().default(""),
  zipCode: z.string().trim().min(1).max(20),
  country: z.string().trim().max(100).optional().default(""),
});

const commercialProfileSchema = z.object({
  premisesType: z.enum(["office", "retail", "warehouse", "industrial", "other"]),
  scale: z.enum(["small", "medium", "large", "enterprise"]),
});

export const moveRequestSchema = z.object({
  moveType: z.enum(["domestic", "commercial", "international"]),
  propertySize: z.enum(["1", "2", "3", "4", "5+", "business"]).optional(),
  commercialProfile: commercialProfileSchema.optional(),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  moveDate: z.string().refine((v) => {
    const d = new Date(v);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, { message: "Move date cannot be in the past" }),
  fullName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s\-']+$/, "Invalid name"),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(32).regex(/^[0-9\s\-\+\(\)]{8,}$/, "Invalid phone"),
  specialInstructions: z.string().max(1000).optional().nullable(),
  pickupCoords: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).nullable().optional(),
  deliveryCoords: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).nullable().optional(),
  // Optional signed estimate produced by /calculate-move-estimate. When
  // present, submit-move-request verifies the HMAC and persists the
  // estimate range alongside the request. Direct "Start Your Move"
  // submissions omit this entirely.
  estimate: z.object({
    token: z.string().min(10).max(2048),
  }).nullable().optional(),
}).refine(
  (v) =>
    v.moveType === "commercial"
      ? !!v.commercialProfile
      : !!v.propertySize,
  { message: "propertySize or commercialProfile is required", path: ["propertySize"] },
);

export type ValidatedMoveRequest = z.infer<typeof moveRequestSchema>;

export function sanitizeInstructions(input: string | null | undefined): string | null {
  if (!input) return null;
  const stripped = input.replace(/<[^>]*>/g, "").trim();
  if (!stripped) return null;
  return stripped.slice(0, 500);
}
