function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-100 dark:bg-white/10 animate-pulse rounded-lg ${className}`}
    />
  );
}

const card =
  "bg-white dark:bg-[#262a31] border border-gray-100 dark:border-white/10 rounded-2xl";

export default function ServiceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1f2228] transition-colors">
      <div className="h-16" />

      {/* Media strip */}
      <div className="flex gap-3 overflow-hidden py-4 px-4 md:px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block
            key={i}
            className="w-72 md:w-96 h-52 md:h-72 rounded-2xl shrink-0"
          />
        ))}
      </div>

      {/* Details */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-2 space-y-6">
        <div className="space-y-2">
          <Block className="h-7 w-2/3" />
          <Block className="h-4 w-1/3" />
        </div>

        <div className="space-y-2">
          <Block className="h-6 w-40 mb-3" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-5/6" />
        </div>

        <div className={`${card} p-5`}>
          <Block className="h-5 w-1/2" />
        </div>
      </div>

      {/* Continue button placeholder */}
      <div className="fixed left-4 sm:left-6 bottom-4">
        <Block className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
