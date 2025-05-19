import type { Deal } from "@repo/db-mock";
import { DealCard } from "./DealCard";
import { SkeletonCard } from "./SkeletonCard";
import { useMemo } from "react";

interface DealsListProps {
  deals: Deal[];
  loading: boolean;
}

export const DealsList = ({ deals, loading }: DealsListProps) => {
  // Find the deal with the highest discount percentage
  const bestDiscountDealId = useMemo(() => {
    if (deals.length === 0) return null;

    let maxDiscountDeal = deals[0];
    deals.forEach((deal) => {
      if (deal.discountPercentage > maxDiscountDeal.discountPercentage) {
        maxDiscountDeal = deal;
      }
    });

    return maxDiscountDeal.id;
  }, [deals]);

  // Show skeleton cards when loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // Show "no deals" message when not loading and no deals found
  if (deals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No deals found matching your criteria.
      </div>
    );
  }

  // Show the actual deals
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          isBestDiscount={deal.id === bestDiscountDealId}
        />
      ))}
    </div>
  );
};
