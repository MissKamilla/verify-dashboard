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
    <div className="rounded-[30px] bg-white px-6 pb-[38px] pt-6 shadow-card">
      <div className="h-[132px] rounded-2xl bg-cover bg-center">
        <img
          src={profileBannerUrl}
          alt=""
          className="h-full w-full rounded-2xl object-cover"
        />
      </div>

      <div className="-mt-[55px] flex flex-col items-center text-center">
        <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[5px] border-white bg-avatar text-[32px] font-bold leading-normal text-white">
          {initials}
        </div>

        <h2 className="mt-3 text-[28px] font-bold leading-normal text-text-main">
          {fullName}
        </h2>

        <p className="text-lg font-normal leading-normal text-text-secondary">
          {email}
        </p>
      </div>
    </div>
  );
}
