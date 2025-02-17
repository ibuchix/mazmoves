
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyOrigin } from "../_shared/verify-origin.ts";

// Define types locally instead of importing from frontend
type MoveType = "domestic" | "commercial" | "international";
type PropertySize = "1" | "2" | "3" | "4" | "5+" | "office" | "warehouse" | "retail";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface MoveRequestForm {
  moveType: MoveType;
  propertySize: PropertySize;
  pickupAddress: Address;
  deliveryAddress: Address;
  moveDate: string;
  fullName: string;
  email: string;
  phone: string;
  specialInstructions?: string;
}

const ALLOWED_MOVE_TYPES: MoveType[] = ["domestic", "commercial", "international"];
const ALLOWED_PROPERTY_SIZES: PropertySize[] = ["1", "2", "3", "4", "5+", "office", "warehouse", "retail"];

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify request origin
    const originError = await verifyOrigin(req);
    if (originError) return originError;

    // Parse request body
    const { moveRequest } = await req.json();

    // Validation rules
    const errors = [];

    // Validate move type
    if (!moveRequest.moveType || !ALLOWED_MOVE_TYPES.includes(moveRequest.moveType)) {
      errors.push({ field: "moveType", message: "Invalid move type selected" });
    }

    // Validate property size
    if (!moveRequest.propertySize || !ALLOWED_PROPERTY_SIZES.includes(moveRequest.propertySize)) {
      errors.push({ field: "propertySize", message: "Invalid property size selected" });
    }

    // Validate addresses
    if (!moveRequest.pickupAddress || !moveRequest.deliveryAddress) {
      errors.push({ field: "address", message: "Both pickup and delivery addresses are required" });
    }

    // Validate date
    if (!moveRequest.moveDate) {
      errors.push({ field: "moveDate", message: "Move date is required" });
    } else {
      const moveDate = new Date(moveRequest.moveDate);
      const today = new Date();
      if (moveDate < today) {
        errors.push({ field: "moveDate", message: "Move date cannot be in the past" });
      }
    }

    // Validate contact information
    if (!moveRequest.fullName || moveRequest.fullName.length < 2) {
      errors.push({ field: "fullName", message: "Valid full name is required" });
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!moveRequest.email || !emailRegex.test(moveRequest.email)) {
      errors.push({ field: "email", message: "Valid email address is required" });
    }

    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    if (!moveRequest.phone || !phoneRegex.test(moveRequest.phone)) {
      errors.push({ field: "phone", message: "Valid phone number is required" });
    }

    // Sanitize special instructions
    if (moveRequest.specialInstructions) {
      // Remove any HTML tags and limit length
      moveRequest.specialInstructions = moveRequest.specialInstructions
        .replace(/<[^>]*>/g, '')
        .slice(0, 500);
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // If validation passes, return sanitized data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...moveRequest,
          specialInstructions: moveRequest.specialInstructions || null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
