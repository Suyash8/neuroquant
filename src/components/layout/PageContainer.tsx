import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div 
      className={cn("p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-zinc-400 font-medium text-lg">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </header>
  );
}
