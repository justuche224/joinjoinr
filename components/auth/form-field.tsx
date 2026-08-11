import React from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const FormField = ({ id, label, error, className, ...props }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3",
          error
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
            : "border-input focus-visible:border-ring focus-visible:ring-ring/50",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
