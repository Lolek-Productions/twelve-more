"use client";

import { cn } from "@/lib/utils"; // Utility from Shadcn for className merging
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react"; // Assuming you have lucide-react installed

const BreadcrumbItem = ({ href, label, isLast = false }) => (
  <div className="flex items-center">
    {href && !isLast ? (
      <Link href={href}>
        <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-gray-900">
          {label}
        </Button>
      </Link>
    ) : (
      <span className={cn("text-gray-900 font-medium", isLast && "text-gray-500")}>
        {label}
      </span>
    )}
    {!isLast && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
  </div>
);

export const Breadcrumb = ({ items }) => (
  <nav className="flex items-center  px-6 ">
    {items.map((item, index) => (
      <BreadcrumbItem
        key={item.label}
        href={item.href}
        label={item.label}
        isLast={index === items.length - 1}
      />
    ))}
  </nav>
);