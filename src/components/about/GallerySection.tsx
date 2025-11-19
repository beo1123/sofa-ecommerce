import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";

export default function GallerySection() {
  return (
    <section className="py-10 rounded-2xl bg-[var(--color-bg-muted)]">
      <Container>
        <Heading level={2} className="text-center mb-12 px-5">
          Gợi ý không gian từ khách hàng
        </Heading>

        <p className="text-center px-5 text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
          Một số hình ảnh thực tế do khách hàng gửi về sau khi bố trí sofa trong nhiều phong cách nội thất khác nhau. Hy
          vọng giúp bạn hình dung rõ hơn về sản phẩm trong không gian sống của mình.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 px-5">
          {sofaImages.gallery.map((src, idx) => (
            <SafeImage
              key={idx}
              src={src}
              width={1920}
              height={1280}
              alt={`Gallery ${idx + 1}`}
              className="rounded-lg shadow-md object-cover h-[220px] sm:h-[240px] lg:h-[280px] w-full 
                         transition-transform duration-300 hover:scale-[1.02]"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
