type IconProps = {
  src: string;
  className?: string;
  ariaHidden?: boolean;
};

export function Icon({ src, className = "", ariaHidden = true }: IconProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url("${src}")`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}
