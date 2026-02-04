import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "TrucksBus - Alın Satın TrucksBus ile Mutlu Kalın",
  description = "Kamyon, minibüs, otobüs ve ticari araç alım satımı için güvenli platform. Binlerce ilan, detaylı filtreler ve güvenli ödeme sistemi.",
  keywords = "kamyon, minibüs, otobüs, ticari araç, alım satım, ikinci el araç, fiyatları, galeri",
  image = "/og-image.jpg",
  url = "https://trucksbus.com.tr",
  type = "website",
}) => {
  useEffect(() => {
    const fullTitle = title.includes("TrucksBus")
      ? title
      : `${title} | TrucksBus`;

    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean
    ) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:type", type, true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);

    // Update canonical link
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
};

export default SEO;
