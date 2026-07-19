import { Button as HeroButton } from "@heroui/react";

export const Button = (props: any) => {
  return (
    <HeroButton {...props} className={props.className || ''}>
      <div className="flex items-center gap-1.5">
        {props.children}
      </div>
    </HeroButton>
  );
};
