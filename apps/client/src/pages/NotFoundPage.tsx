import { Link } from "react-router";

import arrowRightIconUrl from "@/assets/icons/arrow-right.svg";
import notFoundIllustrationUrl from "@/assets/not-found-illustration.svg";

import { Icon } from "@/shared/ui/Icon";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-page-bg px-4 pt-[30px] lg:p-[30px]">
      <section className="flex min-h-[calc(100vh-190px)] flex-1 items-center justify-center rounded-[30px] bg-white px-4 py-[64px] shadow-card lg:min-h-0">
        <div className="flex w-full max-w-[511px] flex-col items-center text-center">
          <h1 className="text-[28px] font-bold leading-normal text-text-main lg:text-2xl">
            Page Not Found
          </h1>

          <p className="mt-4 max-w-[410px] text-xl font-normal leading-normal text-text-secondary lg:mt-2 lg:text-base">
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
            className="mt-[30px] flex h-[50px] w-full max-w-[250px] items-center justify-center gap-2.5 rounded-2xl bg-brand text-base font-bold leading-normal text-white transition-colors hover:bg-avatar active:bg-brand-active"
          >
            <span>Home page</span>
            <Icon
              src={arrowRightIconUrl}
              className="h-3 w-[15px] text-current"
            />
          </Link>
        </div>
      </section>

      <footer className="flex min-h-[131px] shrink-0 items-center justify-center bg-white px-4 lg:min-h-[74px] lg:justify-end lg:bg-transparent lg:px-0">
        <p className="text-center text-sm font-medium leading-6 text-text-main lg:text-right lg:font-normal lg:leading-normal lg:text-text-muted">
          © {new Date().getFullYear()} Verify. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
