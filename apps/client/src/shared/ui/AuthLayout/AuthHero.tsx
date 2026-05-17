import authBackground from "@/assets/auth-background.png";
import verifyLogoWhite from "@/assets/verify-logo-white.svg";
import verifyLogoCard from "@/assets/verify-logo-card.svg";

type AuthHeroProps = {
  variant: "login" | "register";
};
export function AuthHero({ variant }: AuthHeroProps) {
  return (
    <section
      aria-hidden="true"
      className="pointer-events-none relative hidden min-h-screen w-[calc(50vw+59px)] self-stretch select-none overflow-hidden rounded-bl-[180px] min-[1440px]:block"
    >
      <img
        src={authBackground}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {variant === "register" ? (
        <img
          src={verifyLogoWhite}
          alt="Verify"
          draggable={false}
          className="absolute right-[100px] top-[50px] h-[72px] w-[176px]"
        />
      ) : (
        <p className="absolute left-1/2 top-[21vh] -translate-x-1/2 text-[36px] font-bold leading-[56px] text-white">
          Welcome back 👋
        </p>
      )}
      <div className="absolute left-1/2 top-[30vh] flex h-[409px] w-[364px] -translate-x-1/2 items-center justify-center rounded-[16px] border border-white/30 bg-white/5">
        <img
          src={verifyLogoCard}
          alt="Verify"
          draggable={false}
          className="w-[158px]"
        />
      </div>

      <p className="absolute bottom-[40px] right-[100px] text-[14px] font-medium leading-[24px] text-white">
        © {new Date().getFullYear()} Verify. All Rights Reserved.
      </p>
    </section>
  );
}
