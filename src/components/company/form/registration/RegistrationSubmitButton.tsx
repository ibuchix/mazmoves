import { Button } from "@/components/ui/button";

interface RegistrationSubmitButtonProps {
  uploading: boolean;
  rateLimitExceeded: boolean;
}

export function RegistrationSubmitButton({ uploading, rateLimitExceeded }: RegistrationSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full bg-[#040480] hover:bg-[#1f3dd2] text-white font-semibold py-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
      disabled={uploading || rateLimitExceeded}
    >
      {uploading ? (
        <>
          <span className="animate-pulse">Registering...</span>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </>
      ) : rateLimitExceeded ? (
        "Please wait before trying again"
      ) : (
        "Register Company"
      )}
    </Button>
  );
}