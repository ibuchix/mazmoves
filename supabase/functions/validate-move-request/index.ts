import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyOrigin, corsHeaders } from "../_shared/verify-origin.ts";

interface ValidationError {
  field: string;
  message: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
  return phoneRegex.test(phone);
}

function validateAddress(address: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!address.street?.trim()) {
    errors.push({ field: 'street', message: 'Street is required' });
  }
  if (!address.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }
  if (!address.state?.trim()) {
    errors.push({ field: 'state', message: 'State is required' });
  }
  if (!address.zipCode?.trim()) {
    errors.push({ field: 'zipCode', message: 'Zip code is required' });
  }
  
  return errors;
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, ''); // Basic XSS prevention
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify the request origin
    if (!verifyOrigin(req)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized origin' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { moveRequest, clientIp } = await req.json();
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!moveRequest.fullName?.trim()) {
      errors.push({ field: 'fullName', message: 'Full name is required' });
    }

    if (!moveRequest.email || !validateEmail(moveRequest.email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!moveRequest.phone || !validatePhone(moveRequest.phone)) {
      errors.push({ field: 'phone', message: 'Valid phone number is required' });
    }

    if (!moveRequest.moveDate) {
      errors.push({ field: 'moveDate', message: 'Move date is required' });
    } else {
      const moveDate = new Date(moveRequest.moveDate);
      const today = new Date();
      if (moveDate < today) {
        errors.push({ field: 'moveDate', message: 'Move date cannot be in the past' });
      }
    }

    // Validate addresses
    const pickupAddressErrors = validateAddress(moveRequest.pickupAddress);
    const deliveryAddressErrors = validateAddress(moveRequest.deliveryAddress);
    errors.push(...pickupAddressErrors.map(e => ({ ...e, field: `pickupAddress.${e.field}` })));
    errors.push(...deliveryAddressErrors.map(e => ({ ...e, field: `deliveryAddress.${e.field}` })));

    // Check for rate limiting
    const { count } = await supabase
      .from('move_requests')
      .select('id', { count: 'exact' })
      .eq('customer_email', moveRequest.email)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (count && count >= 5) {
      errors.push({ 
        field: 'general', 
        message: 'Maximum request limit reached. Please try again in 24 hours.' 
      });
    }

    if (errors.length > 0) {
      // Log validation failure
      await supabase
        .from('validation_failures')
        .insert({
          request_data: moveRequest,
          failure_reason: JSON.stringify(errors),
          ip_address: clientIp
        });

      return new Response(
        JSON.stringify({ 
          success: false, 
          errors 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Sanitize text inputs
    const sanitizedRequest = {
      ...moveRequest,
      fullName: sanitizeInput(moveRequest.fullName),
      specialInstructions: moveRequest.specialInstructions ? 
        sanitizeInput(moveRequest.specialInstructions) : undefined,
      pickupAddress: {
        ...moveRequest.pickupAddress,
        street: sanitizeInput(moveRequest.pickupAddress.street),
        city: sanitizeInput(moveRequest.pickupAddress.city),
        state: sanitizeInput(moveRequest.pickupAddress.state),
        zipCode: sanitizeInput(moveRequest.pickupAddress.zipCode)
      },
      deliveryAddress: {
        ...moveRequest.deliveryAddress,
        street: sanitizeInput(moveRequest.deliveryAddress.street),
        city: sanitizeInput(moveRequest.deliveryAddress.city),
        state: sanitizeInput(moveRequest.deliveryAddress.state),
        zipCode: sanitizeInput(moveRequest.deliveryAddress.zipCode)
      }
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: sanitizedRequest 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal validation error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
