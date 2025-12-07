import React from "react";
import Button from "@/components/ui/Button";
import { FacebookIcon } from "../ui/Icon/FacebookIcon";
import { ZaloIcon } from "../ui/Icon/ZaloIcon";
import { PhoneIcon } from "../ui/Icon/PhoneIcon";

type Props = {
  facebookUrl: string;
  zaloUrl: string;
  phoneNumber: string;
};

export default function SocialContact({ facebookUrl, zaloUrl, phoneNumber }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Button
        variant="secondary"
        className="scale-90 sm:scale-100 shrink-0"
        onClick={() => window.open(facebookUrl, "_blank")}>
        <FacebookIcon />
      </Button>

      <Button
        variant="secondary"
        className="scale-90 sm:scale-100 shrink-0"
        onClick={() => window.open(zaloUrl, "_blank")}>
        <ZaloIcon />
      </Button>

      <Button
        variant="secondary"
        className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-base scale-90 sm:scale-100 shrink-0"
        onClick={() => (window.location.href = `tel:${phoneNumber}`)}>
        <PhoneIcon />
      </Button>
    </div>
  );
}
