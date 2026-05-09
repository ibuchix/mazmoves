
interface FormProgressProps {
  step: number;  // Changed from currentStep to step
  totalSteps: number;
}

export function FormProgress({ step, totalSteps }: FormProgressProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-center text-[#334155]">
        Step {step} of {totalSteps}
      </h2>
      <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#334155] transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
