import authBackground from "@/assets/auth-background.png";
import verifyLogoHorizontal from "@/assets/verify-logo-horizontal.svg";
import verifyLogoCard from "@/assets/verify-logo-card.svg";

export function AuthHero() {
  return (
    <section className="relative hidden h-[1024px] w-[779px] overflow-hidden rounded-bl-[180px] lg:block ">
      <img
        src={authBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <img
        src={verifyLogoHorizontal}
        alt="Verify"
        className="absolute left-1/2 top-[50px] h-[72px] w-[176px] -translate-x-1/2"
      />

      <div className="absolute left-1/2 top-[308px] flex h-[409px] w-[364px] -translate-x-1/2 items-center justify-center rounded-[16px] border border-white/30 bg-white/5">
        <img src={verifyLogoCard} alt="Verify" className="w-[158px]" />
      </div>

      <p className="absolute bottom-[40px] right-[100px] text-[14px] font-medium leading-[24px] text-white">
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </p>
    </section>
  );
}
