export const SkeletonCard = () => (
  <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 w-full bg-gray-800"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-800 rounded w-full mb-3"></div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 bg-gray-800 rounded w-1/4"></div>
        <div className="h-6 bg-gray-800 rounded w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-800 rounded w-1/3"></div>
    </div>
  </div>
);
