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
  const phone = phoneNumber && phoneNumber !== "undefined" ? phoneNumber : "0932111620";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Button
        variant="secondary"
        aria-label="Facebook"
        className="!p-2 sm:!px-3 sm:!py-2 rounded-full shrink-0"
        onClick={() => window.open(facebookUrl, "_blank")}>
        <FacebookIcon />
      </Button>

      <Button
        variant="secondary"
        aria-label="Zalo"
        className="!p-2 sm:!px-3 sm:!py-2 rounded-full shrink-0"
        onClick={() => window.open(zaloUrl, "_blank")}>
        <ZaloIcon />
      </Button>

      <Button
        variant="secondary"
        aria-label="Gọi điện"
        className="!p-2 sm:!px-3 sm:!py-2 rounded-full shrink-0"
        onClick={() => (window.location.href = `tel:${phone}`)}>
        <PhoneIcon />
      </Button>
    </div>
  );
}
