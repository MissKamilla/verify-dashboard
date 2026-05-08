export function CopyrightFooter() {
  return (
    <footer className="-mx-[16px] mt-[16px] flex min-h-[131px] items-center justify-center bg-white px-[16px] lg:mx-0 lg:mt-auto lg:min-h-0 lg:justify-end lg:bg-transparent lg:px-0 lg:pt-[30px]">
      <p className="text-center text-[14px] font-medium leading-[24px] text-[#161616] lg:text-right lg:font-normal lg:leading-[150%] lg:text-[#A0B1A5]">
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </p>
    </footer>
  );
}
