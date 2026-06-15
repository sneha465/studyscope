import { cn } from "./Button";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "glass-card p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, title, subtitle, children }) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <div>
        {title && <h3 className="text-xl font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
