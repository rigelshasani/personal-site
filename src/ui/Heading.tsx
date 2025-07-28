type Level = 1 | 2 | 3 | 4;
const sizes: Record<Level, string> = {
  1: "text-4xl",
  2: "text-2xl",
  3: "text-xl",
  4: "text-lg",
};

export function Heading({
  level = 2,
  children,
  ...rest
}: { level?: Level } & React.HTMLAttributes<HTMLHeadingElement>) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={`${sizes[level]} font-semibold`} {...rest}>
      {children}
    </Tag>
  );
}
