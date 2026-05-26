import chevronDownIconUrl from "@/assets/icons/chevron-down.svg";

import { DropdownMenu, DropdownMenuItem } from "./DropdownMenu";
import { Icon } from "@/shared/ui/Icon";

export type DropdownOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type DropdownProps<TValue extends string> = {
  value: TValue;
  options: DropdownOption<TValue>[];
  ariaLabel: string;
  onChange: (value: TValue) => void;
};

export function Dropdown<TValue extends string>({
  value,
  options,
  ariaLabel,
  onChange,
}: DropdownProps<TValue>) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownMenu
      menuClassName="left-0 top-[58px] z-50 w-full rounded-3xl"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex h-[50px] w-full cursor-pointer items-center justify-between rounded-2xl border border-border-default bg-white px-4 text-left text-sm text-text-main outline-none transition-colors hover:border-brand"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span>{selectedOption?.label}</span>

          <Icon
            src={chevronDownIconUrl}
            className={`h-4 w-4 shrink-0 text-text-main transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              isSelected={option.value === value}
              onClick={() => {
                onChange(option.value);
                close();
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </>
      )}
    </DropdownMenu>
  );
}
