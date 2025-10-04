# 🌍 TrucksBus - Çoklu Dil Desteği (i18n)

## 📦 Kurulum

Projede **react-i18next** kütüphanesi kullanılarak Türkçe ve İngilizce dil desteği eklenmiştir.

### Yüklü Paketler

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## 🗂️ Dosya Yapısı

```
client/src/
├── i18n/
│   ├── config.ts              # i18n yapılandırması
│   └── locales/
│       ├── tr.json            # Türkçe çeviriler
│       └── en.json            # İngilizce çeviriler
└── components/
    └── common/
        └── LanguageSwitcher.tsx  # Dil değiştirme komponenti
```

## 🚀 Kullanım

### 1. Component'lerde Kullanım

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>{t("common.description")}</p>
    </div>
  );
}
```

### 2. Parametreli Çeviriler

```tsx
// tr.json
{
  "createAd": {
    "maxPhotos": "En fazla {{count}} fotoğraf yükleyebilirsiniz"
  }
}

// Component
<p>{t('createAd.maxPhotos', { count: 10 })}</p>
```

### 3. Dil Değiştirme

```tsx
import { useTranslation } from "react-i18next";

function LanguageButton() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return <button onClick={() => changeLanguage("en")}>English</button>;
}
```

### 4. Header'a Ekleme

LanguageSwitcher komponenti Header'a eklenmiştir:

```tsx
import LanguageSwitcher from "../common/LanguageSwitcher";

// Header component'inde
<LanguageSwitcher />;
```

## 📝 Yeni Çeviri Ekleme

### 1. Çeviri Dosyalarına Ekle

**tr.json**

```json
{
  "newSection": {
    "title": "Yeni Başlık",
    "description": "Açıklama"
  }
}
```

**en.json**

```json
{
  "newSection": {
    "title": "New Title",
    "description": "Description"
  }
}
```

### 2. Component'te Kullan

```tsx
const { t } = useTranslation();

<h1>{t('newSection.title')}</h1>
<p>{t('newSection.description')}</p>
```

## 🎯 Mevcut Çeviriler

### Ana Bölümler:

- ✅ **common** - Genel kelimeler (Giriş, Kayıt, Ara, vb.)
- ✅ **categories** - Kategori isimleri
- ✅ **filters** - Filtre terimleri
- ✅ **adDetails** - İlan detay sayfası
- ✅ **createAd** - İlan oluşturma formu
- ✅ **auth** - Giriş/Kayıt sayfası
- ✅ **footer** - Footer bölümü

## 🌐 Desteklenen Diller

- 🇹🇷 **Türkçe** (tr) - Varsayılan
- 🇬🇧 **İngilizce** (en)

## 📌 Önemli Notlar

1. **Varsayılan Dil**: Türkçe (`fallbackLng: 'tr'`)
2. **Dil Tespiti**: Tarayıcı dili otomatik algılanır
3. **Yerel Depolama**: Seçilen dil localStorage'da saklanır
4. **Dinamik Yükleme**: Çeviri dosyaları dinamik olarak yüklenir

## 🔧 Yapılandırma

`client/src/i18n/config.ts` dosyasında:

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: "tr",
    lng: "tr",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });
```

## 🎨 LanguageSwitcher Komponenti

Header'da dil değiştirme için Material-UI kullanılarak oluşturulmuş bir menü:

- 🌐 İkon: LanguageIcon
- 🇹🇷 Türkçe bayrağı
- 🇬🇧 İngilizce bayrağı
- ✅ Seçili dilin vurgulanması
- 💾 localStorage'da saklanması

## 📊 Örnek Kullanım Alanları

### Splash Screen

```tsx
<LoadingScreen message={t("common.welcome")} />
```

### Login Formu

```tsx
<Button>{t('auth.loginTitle')}</Button>
<TextField label={t('auth.email')} />
<TextField label={t('auth.password')} />
```

### Footer

```tsx
<Typography>{t('footer.copyright')}</Typography>
<Link>{t('footer.quickLinks')}</Link>
```

## 🚧 Gelecek Geliştirmeler

- [ ] Daha fazla dil ekle (Almanca, Fransızca, vb.)
- [ ] Çeviri yönetim paneli
- [ ] Otomatik çeviri entegrasyonu
- [ ] Dinamik dil yükleme (lazy loading)
- [ ] SEO için dil bazlı URL'ler

## 📞 Destek

Dil sistemi ile ilgili sorunlar için:

- GitHub Issues'da bildirin
- Çeviri hatalarını düzeltin (Pull Request)
