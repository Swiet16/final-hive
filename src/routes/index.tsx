import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { BrandStrip } from "@/components/site/BrandStrip";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { FinancingCTA } from "@/components/site/FinancingCTA";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <FeaturedProducts />
      <FinancingCTA />
    </>
  );
}
