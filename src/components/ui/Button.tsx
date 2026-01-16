import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-500/90 text-white hover:bg-indigo-500 focus-visible:outline-indigo-400",
  secondary:
    "bg-white/5 text-white/90 hover:bg-white/10 focus-visible:outline-white/30",
  danger:
    "bg-rose-500/90 text-white hover:bg-rose-500 focus-visible:outline-rose-400",
};

export function Button({
  children,
  onClick,
  disabled,
  variant = "secondary",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
        variantClass[variant]
      }
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
        variantClass[variant]
      }
    >
      {children}
    </Link>
  );
}
