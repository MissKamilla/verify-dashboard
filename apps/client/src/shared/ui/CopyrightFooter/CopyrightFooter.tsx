type CopyrightFooterProps = {
  className?: string;
};

export function CopyrightFooter({ className = "" }: CopyrightFooterProps) {
  return (
    <footer
      className={`-mx-[16px] mt-4 flex min-h-[131px] items-center justify-center bg-white px-4 lg:mx-0 lg:mt-auto lg:min-h-0 lg:justify-end lg:bg-transparent lg:px-0 lg:pt-[30px] ${className}`}
    >
      <p className="text-center text-sm font-medium leading-6 text-text-main lg:text-right lg:font-normal lg:leading-normal lg:text-text-muted">
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </p>
    </footer>
  );
}
