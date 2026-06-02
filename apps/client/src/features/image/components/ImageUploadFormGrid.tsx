import type { ReactNode } from "react";

type ImageUploadFormGridProps = {
  children: ReactNode;
};

export function ImageUploadFormGrid({ children }: ImageUploadFormGridProps) {
  return (
    <div className="mx-auto grid w-full max-w-[330px] gap-[30px] md:mx-0 md:min-h-0 md:max-w-none md:flex-1 md:grid-cols-[330px_minmax(0,680px)] md:gap-[50px] md:overflow-hidden 2xl:grid-cols-[360px_minmax(0,780px)]">
      {children}
    </div>
  );
}
