// submit-move-request/validation.ts
// Re-exports the shared move-request validation schema. The canonical copy
// lives in _shared/move-request-validation.ts so other edge functions
// (e.g. mcp-server) can reuse it without cross-function imports, which the
// Supabase Edge Functions bundler does not support.

export {
  moveRequestSchema,
  sanitizeInstructions,
  type ValidatedMoveRequest,
} from "../_shared/move-request-validation.ts";

