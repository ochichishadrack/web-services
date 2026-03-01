// components/ui/FullPageLoader.tsx
export default function SkeletonCard() {
  return (
    <div className="fixed inset-0 bg-green-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Modern ring spinner */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
        </div>

        <p className="text-sm text-gray-500 tracking-wide">Loading</p>
      </div>
    </div>
  );
}
