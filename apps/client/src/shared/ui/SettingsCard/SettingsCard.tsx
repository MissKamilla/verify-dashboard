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
      <h2 className="text-2xl font-bold leading-normal text-text-main">
        {title}
      </h2>

      <p className="mt-2 text-base font-normal leading-normal text-text-secondary">
        {description}
      </p>

      <div className="mt-9">{children}</div>
    </section>
  );
}
