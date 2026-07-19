import { Switch as HeroSwitch } from "@heroui/react";

export const Switch = (props: any) => {
  return <HeroSwitch {...props} classNames={{
    wrapper: "bg-[var(--color-dark-glass)] border border-white/10 shadow-sm group-data-[selected=true]:bg-[var(--color-vibrant-orange)]",
    thumb: "bg-white shadow-[0_0_10px_white]",
    label: "text-orange-400 font-bold drop-shadow-sm",
    ...props.classNames
  }} />;
};
