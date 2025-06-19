
import DOMPurify from "dompurify";

export class InputValidator {
  // Stricter phone number validation
  static validatePhone(phone: string): { isValid: boolean; message?: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Support international formats: 10-15 digits
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { isValid: false, message: "Phone number must be 10-15 digits" };
    }
    
    // Check for valid international format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return { isValid: false, message: "Invalid phone number format" };
    }
    
    return { isValid: true };
  }

  // Enhanced address validation
  static validateAddress(address: string): { isValid: boolean; message?: string } {
    const sanitized = DOMPurify.sanitize(address.trim());
    
    if (sanitized.length < 5 || sanitized.length > 100) {
      return { isValid: false, message: "Address must be 5-100 characters" };
    }
    
    // Prevent common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(address)) {
        return { isValid: false, message: "Invalid characters in address" };
      }
    }
    
    // Basic address format validation
    const addressRegex = /^[a-zA-Z0-9\s,.\-#'\/\(\)]+$/;
    if (!addressRegex.test(sanitized)) {
      return { isValid: false, message: "Address contains invalid characters" };
    }
    
    return { isValid: true };
  }

  // Enhanced email validation
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    return { isValid: true };
  }

  // Sanitize special instructions
  static sanitizeInstructions(instructions: string): string {
    if (!instructions) return '';
    
    // Remove HTML tags and dangerous content
    let sanitized = DOMPurify.sanitize(instructions, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }
    
    return sanitized.trim();
  }

  // Validate company name
  static validateCompanyName(name: string): { isValid: boolean; message?: string } {
    const sanitized = DOMPurify.sanitize(name.trim());
    
    if (sanitized.length < 2 || sanitized.length > 100) {
      return { isValid: false, message: "Company name must be 2-100 characters" };
    }
    
    // Allow letters, numbers, spaces, and common business characters
    const nameRegex = /^[a-zA-Z0-9\s\-&.,'\(\)]+$/;
    if (!nameRegex.test(sanitized)) {
      return { isValid: false, message: "Company name contains invalid characters" };
    }
    
    return { isValid: true };
  }

  // General text sanitization
  static sanitizeText(text: string, maxLength: number = 255): string {
    if (!text) return '';
    
    let sanitized = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized.trim();
  }
}
