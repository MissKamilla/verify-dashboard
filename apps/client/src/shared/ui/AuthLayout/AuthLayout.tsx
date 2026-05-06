import type { ReactNode } from "react";

import { AuthHero } from "@/shared/ui/AuthHero";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[661px_779px] lg:justify-center">
      <section className="min-h-screen lg:min-h-[1024px]">
        <div className="mx-auto w-full max-w-[410px] px-5 py-10 lg:mx-0 lg:ml-[100px] lg:mt-[60px] lg:px-0 lg:py-0">
          {children}
        </div>
      </section>

      <AuthHero />
    </main>
  );
}
