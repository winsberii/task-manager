
interface DropZoneIndicatorProps {
  isActive: boolean;
  position: 'top' | 'bottom' | 'inside';
}

export const DropZoneIndicator = ({ isActive, position }: DropZoneIndicatorProps) => {
  if (!isActive) return null;

  const baseClasses = "absolute left-0 right-0 h-0.5 bg-blue-500 transition-all duration-200";
  const positionClasses = {
    top: "-top-1",
    bottom: "-bottom-1", 
    inside: "top-1/2"
  };

  return (
    <div className={`${baseClasses} ${positionClasses[position]} z-10`}>
      <div className="absolute left-2 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
    </div>
  );
};
