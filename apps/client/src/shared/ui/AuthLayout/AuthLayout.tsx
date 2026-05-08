import type { ReactNode } from "react";

import { AuthHero } from "@/shared/ui/AuthHero";

type AuthLayoutProps = {
  children: ReactNode;
  heroVariant: "login" | "register";
};

export function AuthLayout({ children, heroVariant }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white min-[1440px]:grid min-[1440px]:grid-cols-[661px_779px] min-[1440px]:justify-center">
      <section className="flex min-h-screen flex-col min-[1440px]:block min-[1440px]:min-h-[1024px]">
        <div className="mx-auto w-full max-w-[410px] px-5 pt-[60px] pb-10 min-[1440px]:mx-0 min-[1440px]:ml-[100px] min-[1440px]:mt-[60px] min-[1440px]:px-0 min-[1440px]:py-0">
          {children}
        </div>

        <p className="mt-auto px-5 pb-[53px] pt-[53px] text-center text-[14px] font-medium leading-[24px] text-text-main min-[1440px]:hidden">
          © {new Date().getFullYear()} Verify. All Rights Reserved.
        </p>
      </section>

      <AuthHero variant={heroVariant} />
    </main>
  );
}
