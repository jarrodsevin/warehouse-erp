// app/products/view/layout.tsx
import React from "react";
import PageLayout from "../../components/PageLayout";
import "./theme-override.css";
import RouteOverrides from "./RouteOverrides"; // client style injector

export default function ProductsViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout
      title="Products"
      subtitle="Browse, filter, and inspect products"
      breadcrumbs={[
        { label: "Products", href: "/products" },
        { label: "View", href: "/products/view" },
      ]}
    >
      <div className="unify-theme">
        {children}
        {/* Inject final order overrides so they win */}
        <RouteOverrides />
      </div>
    </PageLayout>
  );
}
