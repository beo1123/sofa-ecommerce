export default function ContactMap({ address = "C12/17, Ấp 3, Bình Chánh, TPHCM" }) {
  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className="w-full h-full overflow-hidden rounded-lg border">
      <iframe src={mapSrc} className="w-full h-full block" allowFullScreen loading="lazy" title="Location Map" />
    </div>
  );
}
