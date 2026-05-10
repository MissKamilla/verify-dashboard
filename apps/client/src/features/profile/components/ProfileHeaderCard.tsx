import profileBannerUrl from "@/assets/profile-banner.png";

type ProfileHeaderCardProps = {
  fullName: string;
  email: string;
  initials: string;
};

export function ProfileHeaderCard({
  fullName,
  email,
  initials,
}: ProfileHeaderCardProps) {
  return (
    <div className="rounded-[30px] bg-white px-[24px] pb-[38px] pt-[24px] shadow-card">
      <div className="h-[132px] rounded-[16px] bg-cover bg-center">
        <img
          src={profileBannerUrl}
          alt=""
          className="h-full w-full rounded-[16px] object-cover"
        />
      </div>

      <div className="-mt-[55px] flex flex-col items-center text-center">
        <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[5px] border-white bg-avatar text-[32px] font-bold leading-[150%] text-white">
          {initials}
        </div>

        <h2 className="mt-[12px] text-[28px] font-bold leading-[150%] text-text-main">
          {fullName}
        </h2>

        <p className="text-[18px] font-normal leading-[150%] text-text-secondary">
          {email}
        </p>
      </div>
    </div>
  );
}
