import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { SuccessDialog } from "./SuccessDialog";
import { FormProgress } from "./FormProgress";
import { MoveRequestFormContent } from "./MoveRequestFormContent";
import { useMoveRequestForm } from "./hooks/useMoveRequestForm";

export function MoveRequestForm() {
  const {
    step,
    totalSteps,
    moveType,
    register,
    errors,
    watch,
    isProcessing,
    showSuccess,
    handleSubmit,
    handleFormSubmit,
    handleMoveTypeChange,
    handleSuccessClose,
    nextStep,
    prevStep
  } = useMoveRequestForm();

  return (
    <div data-testid="move-request-form" className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {isProcessing && <LoadingOverlay />}
            
            <FormProgress step={step} totalSteps={totalSteps} />

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <MoveRequestFormContent
                step={step}
                totalSteps={totalSteps}
                moveType={moveType}
                register={register}
                errors={errors}
                watch={watch}
                isProcessing={isProcessing}
                onMoveTypeChange={handleMoveTypeChange}
                onNext={nextStep}
                onPrevious={prevStep}
              />
            </form>
          </div>
        </CardContent>
      </Card>

      <SuccessDialog 
        isOpen={showSuccess} 
        onClose={handleSuccessClose}
      />
    </div>
  );
}
