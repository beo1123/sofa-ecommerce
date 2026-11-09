import Heading from "@/components/ui/Heading";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";

export default function GallerySection() {
  return (
    <section className="p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)]">
      <Heading level={2} className="text-center text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4">
        Gợi ý không gian từ khách hàng
      </Heading>

      <p className="text-center text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl mx-auto mb-6 sm:mb-10">
        Một số hình ảnh thực tế do khách hàng gửi về sau khi bố trí sofa trong nhiều phong cách nội thất khác nhau. Hy
        vọng giúp bạn hình dung rõ hơn về sản phẩm trong không gian sống của mình.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sofaImages.gallery.map((src, idx) => (
          <SafeImage
            key={idx}
            src={src}
            width={1920}
            height={1280}
            alt={`Gallery ${idx + 1}`}
            className="rounded-2xl shadow-md object-cover h-[220px] sm:h-[240px] lg:h-[280px] w-full transition-transform duration-300 hover:scale-[1.02]"
          />
        ))}
      </div>
    </section>
  );
}
