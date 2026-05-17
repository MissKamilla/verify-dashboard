import { Link } from "react-router";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import notFoundIllustrationUrl from "@/assets/not-found-illustration.svg";

import { Icon } from "@/shared/ui/Icon";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-page-bg px-[16px] pt-[30px] lg:p-[30px]">
      <section className="flex min-h-[calc(100vh-190px)] flex-1 items-center justify-center rounded-[30px] bg-white px-[16px] py-[64px] shadow-card lg:min-h-0">
        <div className="flex w-full max-w-[511px] flex-col items-center text-center">
          <h1 className="text-[28px] font-bold leading-[150%] text-text-main lg:text-[24px]">
            Page Not Found
          </h1>

          <p className="mt-[16px] max-w-[410px] text-[20px] font-normal leading-[150%] text-text-secondary lg:mt-[8px] lg:text-[16px]">
            Sorry, the page you requested could not be found. Please go back to
            the home page.
          </p>

          <img
            src={notFoundIllustrationUrl}
            alt=""
            className="mt-[34px] h-auto w-full max-w-[289px] object-contain lg:mt-[42px] lg:max-w-[511px]"
          />

          <Link
            to="/"
            className="mt-[30px] flex h-[50px] w-full max-w-[250px] items-center justify-center gap-[10px] rounded-[16px] bg-brand text-[16px] font-bold leading-[150%] text-white transition-colors hover:bg-avatar active:bg-brand-active"
          >
            <span>Home page</span>
            <Icon
              src={arrowRightIconUrl}
              className="h-[12px] w-[15px] text-current"
            />
          </Link>
        </div>
      </section>

      <footer className="flex min-h-[131px] shrink-0 items-center justify-center bg-white px-[16px] lg:min-h-[74px] lg:justify-end lg:bg-transparent lg:px-0">
        <p className="text-center text-[14px] font-medium leading-[24px] text-text-main lg:text-right lg:font-normal lg:leading-[150%] lg:text-text-muted">
          © {new Date().getFullYear()} Verify. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
