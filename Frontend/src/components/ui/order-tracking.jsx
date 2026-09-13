import * as React from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const OrderTracking = React.forwardRef(
  ({ steps = [], className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full max-w-md", className)} {...props}>
        {steps.length > 0 ? (
          <div>
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex transition-all duration-500 ease-out",
                  step.isCompleted ? "opacity-100" : "opacity-70"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "transition-all duration-500 ease-out",
                      step.isCompleted ? "scale-100" : "scale-90"
                    )}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2
                        className={cn(
                          "h-6 w-6 shrink-0 text-primary/70",
                          "animate-in zoom-in-50 duration-300"
                        )}
                      />
                    ) : (
                      <Circle className="h-6 w-6 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn("w-[1.5px] grow transition-colors duration-700", {
                        "bg-primary/70": steps[index + 1].isCompleted,
                        "bg-muted-foreground": !steps[index + 1].isCompleted,
                      })}
                    />
                  )}
                </div>
                <div className="ml-3 pb-6">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      step.isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/80">
            This task has no tracking information yet.
          </p>
        )}
      </div>
    )
  }
)

OrderTracking.displayName = "OrderTracking"

export { OrderTracking }
