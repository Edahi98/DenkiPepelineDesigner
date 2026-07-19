import { Checkbox as HeroCheckbox } from "@heroui/react";

export const Checkbox = (props: any) => {
  return <HeroCheckbox {...props} classNames={{
    wrapper: "border border-white/10 shadow-sm",
    label: "text-emerald-400 font-bold drop-shadow-sm",
    ...props.classNames
  }} />;
};
