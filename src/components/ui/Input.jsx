import { cn } from "./Button";

export function Input({ className, label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 ml-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          "input-field",
          error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>
      )}
    </div>
  );
}
