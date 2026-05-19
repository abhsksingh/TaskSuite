export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-[#1A1D27] rounded-lg border border-[#2D3248] overflow-hidden ${className}`}>
      <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-[#22263A]/50 to-transparent bg-[length:200%_100%]" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#1A1D27] rounded-lg border border-[#2D3248] p-5 space-y-3 animate-fade-slide-up">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-[#1A1D27] rounded-lg border border-[#2D3248] p-5 space-y-2 animate-fade-slide-up">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
