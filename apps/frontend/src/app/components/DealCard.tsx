import Image from "next/image";
import type { Deal } from "@repo/db-mock";

interface DealCardProps {
  deal: Deal & { distance?: number };
  isBestDiscount?: boolean;
}

export const DealCard = ({ deal, isBestDiscount = false }: DealCardProps) => {
  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group transform hover:scale-105">
      {deal.imageUrl && (
        <div className="relative h-60 w-full">
          <Image
            src={deal.imageUrl}
            alt={deal.title}
            fill
            className="object-cover group-hover:opacity-90"
          />

          {/* Tags display at top */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="absolute top-2 right-2 z-10 flex gap-1 flex-wrap justify-end max-w-[70%]">
              {deal.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-900 bg-opacity-80 text-gray-200 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Popular badge on left */}
          {deal.quantitySold > 500 && (
            <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </div>
          )}

          {/* Best Discount badge */}
          {isBestDiscount && (
            <div className="absolute top-2 left-2 z-20 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              Best Discount
            </div>
          )}

          {/* If both Popular and Best Discount, adjust position */}
          {deal.quantitySold > 500 && isBestDiscount && (
            <style jsx>{`
              div:nth-of-type(3) {
                top: 30px !important;
              }
            `}</style>
          )}

          {/* Merchant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="flex items-center text-white">
              <span className="text-sm font-medium">{deal.merchantName}</span>
              <div className="ml-auto flex items-center">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {deal.discountPercentage}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 text-white">
        <h3 className="text-xl font-semibold mb-2 text-white group-hover:underline">
          {deal.title}
        </h3>
        <p className="text-gray-400 mb-3 line-clamp-2">{deal.description}</p>

        {/* Price information */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2 flex-row justify-between">
            <div className="flex flex-row gap-1">
              <div className="text-gray-500 line-through text-sm">
                ${deal.originalPrice}
              </div>
              <div className="text-green-500 font-bold text-2xl">
                ${deal.discountPrice}
              </div>
              <div
                className={`flex items-center justify-center rounded-full px-2 py-1 text-sm font-semibold ${
                  isBestDiscount
                    ? "bg-amber-900 text-amber-400"
                    : "bg-green-900 text-green-400"
                }`}
              >
                -{deal.discountPercentage}% OFF
              </div>
            </div>

            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5 text-yellow-400 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold">
                  {deal.averageRating?.toFixed(1) ||
                    deal.merchantRating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  ({deal.reviewCount || 0})
                </span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">
                  {deal.quantitySold} sold
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center mt-2">
          {/* Location/Distance Information */}
          <div className="flex items-center text-xs text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {deal.distance !== undefined ? (
              <span className="text-green-400 font-medium">
                {deal.distance.toFixed(1)} miles away
              </span>
            ) : (
              <span>
                {deal.location?.city}, {deal.location?.state}
              </span>
            )}
          </div>

          {/* Expiry Date */}
          {deal.expiryDate && (
            <div className="text-xs text-gray-400">
              Expires: {formatDate(deal.expiryDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
