import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        role="radiogroup"
        ref={ref}
        className={cn("grid gap-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (
            !React.isValidElement(child) ||
            typeof child.props !== "object" ||
            child.props === null
          ) {
            return child;
          }

          const props = child.props as Record<string, unknown>;

          if (props.value !== undefined && typeof props.value === "string") {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              checked: props.value === value,
              onCheckedChange: () => {
                if (onValueChange) {
                  onValueChange(props.value as string);
                }
              },
            });
          }

          if (props.children) {
            const patchedChildren = React.Children.map(
              props.children as React.ReactNode,
              (innerChild) => {
                if (
                  !React.isValidElement(innerChild) ||
                  typeof innerChild.props !== "object" ||
                  innerChild.props === null
                ) {
                  return innerChild;
                }
                const innerProps = innerChild.props as Record<string, unknown>;
                if (innerProps.value !== undefined && typeof innerProps.value === "string") {
                  return React.cloneElement(
                    innerChild as React.ReactElement<Record<string, unknown>>,
                    {
                      checked: innerProps.value === value,
                      onCheckedChange: () => {
                        if (onValueChange) {
                          onValueChange(innerProps.value as string);
                        }
                      },
                    },
                  );
                }
                return innerChild;
              },
            );
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              children: patchedChildren,
            });
          }

          return child;
        })}
      </div>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  checked?: boolean;
  onCheckedChange?: () => void;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value: _value, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="radio"
        ref={ref}
        checked={checked}
        onChange={onCheckedChange}
        className={cn(
          "h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
