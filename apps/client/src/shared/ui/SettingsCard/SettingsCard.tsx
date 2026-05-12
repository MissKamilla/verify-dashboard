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
    <section className="rounded-[30px] bg-white p-[30px] shadow-card">
      <h2 className="text-[24px] font-bold leading-[150%] text-text-main">
        {title}
      </h2>

      <p className="mt-[8px] text-[16px] font-normal leading-[150%] text-text-secondary">
        {description}
      </p>

      <div className="mt-[36px]">{children}</div>
    </section>
  );
}
