import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const box = cva("", {
  variants: {
    variant: {
      default: "",
      padded: "p-4",
      surface: "bg-surface p-4 rounded-md",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BoxProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof box>;

export function Box({ className = "", variant, ...rest }: BoxProps) {
  return <div className={clsx(box({ variant }), className)} {...rest} />;
}
