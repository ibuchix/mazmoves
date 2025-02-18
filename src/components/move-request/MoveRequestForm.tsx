
import { MoveRequestFormContent } from "./MoveRequestFormContent";
import { FormProgress } from "./FormProgress";
import { SuccessDialog } from "./SuccessDialog";
import { useMoveRequestForm } from "./hooks/useMoveRequestForm";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export function MoveRequestForm() {
  const {
    step,
    totalSteps,
    moveType,
    register,
    errors,
    watch,
    setValue,
    isProcessing,
    showSuccess,
    handleSubmit,
    handleMoveTypeChange,
    handleSuccessClose,
    nextStep,
    prevStep,
    isGeocodingPickup,
    isGeocodingDelivery,
    isValid
  } = useMoveRequestForm();

  return (
    <div className="relative max-w-2xl mx-auto p-4 space-y-6" data-testid="move-request-form">
      {isProcessing && (
        <LoadingOverlay message="Processing your request..." />
      )}
      
      <FormProgress step={step} totalSteps={totalSteps} />
      
      <MoveRequestFormContent
        step={step}
        totalSteps={totalSteps}
        moveType={moveType}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isProcessing={isProcessing}
        onMoveTypeChange={handleMoveTypeChange}
        onNext={nextStep}
        onPrevious={prevStep}
        isGeocodingPickup={isGeocodingPickup}
        isGeocodingDelivery={isGeocodingDelivery}
        onSubmit={handleSubmit}
        isValid={isValid}
      />

      <SuccessDialog 
        isOpen={showSuccess} 
        onClose={handleSuccessClose} 
      />
    </div>
  );
}
