import { Input as HeroInput } from "@heroui/react";

export const Input = (props: any) => {
  return <HeroInput {...props} classNames={{
    inputWrapper: "bg-[var(--color-dark-glass)] border border-white/10 shadow-sm rounded-lg text-white backdrop-blur-md focus-within:border-white/30 focus-within:shadow-lg",
    input: "text-white font-bold placeholder:text-gray-200 font-semibold-300",
    ...props.classNames
  }} />;
};
