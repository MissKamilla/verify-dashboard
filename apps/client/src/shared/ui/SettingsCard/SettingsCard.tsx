import type { ReactNode } from "react";

type SettingsCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section className="rounded-[30px] bg-white p-[30px] shadow-[14px_17px_40px_4px_rgba(125,181,147,0.08)]">
      <h2 className="text-[24px] font-bold leading-[150%] text-[#161616]">
        {title}
      </h2>

      <p className="mt-[8px] text-[16px] font-normal leading-[150%] text-[#878787]">
        {description}
      </p>

      <div className="mt-[36px]">{children}</div>
    </section>
  );
}
