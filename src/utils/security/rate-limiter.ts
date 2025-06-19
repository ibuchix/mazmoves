
import { supabase } from "@/integrations/supabase/client";

export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  identifier: string; // email, IP, or user ID
  action: string; // registration, login, password_reset, etc.
}

export class RateLimiter {
  static async checkLimit(config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit_v2', {
        p_identifier: config.identifier,
        p_action: config.action,
        p_max_attempts: config.maxAttempts,
        p_window_minutes: config.windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // Fail open for now to prevent blocking legitimate users
        return { allowed: true, remaining: config.maxAttempts };
      }

      return {
        allowed: data?.allowed || false,
        remaining: data?.remaining || 0
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      return { allowed: true, remaining: config.maxAttempts };
    }
  }

  static async recordAttempt(config: RateLimitConfig): Promise<void> {
    try {
      await supabase.rpc('record_rate_limit_attempt', {
        p_identifier: config.identifier,
        p_action: config.action
      });
    } catch (error) {
      console.error('Rate limit recording error:', error);
    }
  }

  // Predefined rate limit configurations
  static readonly CONFIGS = {
    REGISTRATION: (identifier: string): RateLimitConfig => ({
      maxAttempts: 3,
      windowMinutes: 60,
      identifier,
      action: 'registration'
    }),

    LOGIN: (identifier: string): RateLimitConfig => ({
      maxAttempts: 5,
      windowMinutes: 30,
      identifier,
      action: 'login'
    }),

    PASSWORD_RESET: (identifier: string): RateLimitConfig => ({
      maxAttempts: 3,
      windowMinutes: 60,
      identifier,
      action: 'password_reset'
    }),

    EMAIL_VERIFICATION: (identifier: string): RateLimitConfig => ({
      maxAttempts: 5,
      windowMinutes: 60,
      identifier,
      action: 'email_verification'
    })
  };
}
