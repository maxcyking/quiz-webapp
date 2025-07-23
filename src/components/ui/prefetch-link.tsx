"use client";

import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

interface PrefetchLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ href, children, className, prefetch = true, ...props }, ref) => {
    const router = useRouter();

    // Next.js automatically handles prefetching for Link components
    // when prefetch prop is true (which is the default)
    
    return (
      <Link
        href={href}
        className={className}
        prefetch={prefetch}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

PrefetchLink.displayName = "PrefetchLink";

export { PrefetchLink };