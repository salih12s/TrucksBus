import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...\n");

    // ==========================================
    // 1. CATEGORIES (9 adet)
    // ==========================================
    console.log("📂 Creating categories...");
    const categories = await Promise.all([
        prisma.category.upsert({ where: { slug: "cekici" }, update: {}, create: { name: "Çekici", slug: "cekici", displayOrder: 1, iconUrl: "/CategoryImage/cekici.png", description: "Çekici araçlar" } }),
        prisma.category.upsert({ where: { slug: "dorse" }, update: {}, create: { name: "Dorse", slug: "dorse", displayOrder: 2, iconUrl: "/CategoryImage/Dorse.png", description: "Dorse çeşitleri" } }),
        prisma.category.upsert({ where: { slug: "kamyon-kamyonet" }, update: {}, create: { name: "Kamyon & Kamyonet", slug: "kamyon-kamyonet", displayOrder: 3, iconUrl: "/CategoryImage/KamyonKamyonet.png", description: "Kamyon ve kamyonet araçlar" } }),
        prisma.category.upsert({ where: { slug: "karoser-ust-yapi" }, update: {}, create: { name: "Karoser & Üst Yapı", slug: "karoser-ust-yapi", displayOrder: 4, iconUrl: "/CategoryImage/karoser-ust-yapi.png", description: "Karoser ve üst yapı" } }),
        prisma.category.upsert({ where: { slug: "minibus-midibus" }, update: {}, create: { name: "Minibüs & Midibüs", slug: "minibus-midibus", displayOrder: 5, iconUrl: "/CategoryImage/minibus-midibus.png", description: "Minibüs ve midibüs araçlar" } }),
        prisma.category.upsert({ where: { slug: "otobus" }, update: {}, create: { name: "Otobüs", slug: "otobus", displayOrder: 6, iconUrl: "/CategoryImage/otobus.png", description: "Otobüs araçlar" } }),
        prisma.category.upsert({ where: { slug: "oto-kurtarici-tasiyici" }, update: {}, create: { name: "Oto Kurtarıcı & Taşıyıcı", slug: "oto-kurtarici-tasiyici", displayOrder: 7, iconUrl: "/CategoryImage/oto-kurtarici-tasiyici.png", description: "Oto kurtarıcı ve taşıyıcı araçlar" } }),
        prisma.category.upsert({ where: { slug: "romork" }, update: {}, create: { name: "Römork", slug: "romork", displayOrder: 8, iconUrl: "/CategoryImage/romork.png", description: "Römork çeşitleri" } }),
        prisma.category.upsert({ where: { slug: "minivan-panelvan" }, update: {}, create: { name: "Minivan & Panelvan", slug: "minivan-panelvan", displayOrder: 9, iconUrl: "/CategoryImage/minivan-panelvan.png", description: "Minivan ve panelvan araçlar" } }),
    ]);

    const catMap: Record<string, number> = {};
    for (const c of categories) {
        catMap[c.slug] = c.id;
    }
    console.log(`  ✅ ${categories.length} categories created`);

    // ==========================================
    // 2. BRANDS
    // ==========================================
    console.log("🏷️  Creating brands...");

    const brandData: { name: string; slug: string; logoUrl?: string }[] = [
        // Ağır ticari marka listesi
        { name: "Mercedes", slug: "mercedes", logoUrl: "/BrandsImage/Mercedes.png" },
        { name: "Volvo", slug: "volvo", logoUrl: "/BrandsImage/Volvo.png" },
        { name: "MAN", slug: "man", logoUrl: "/BrandsImage/MAN.png" },
        { name: "Scania", slug: "scania", logoUrl: "/BrandsImage/Scania.png" },
        { name: "DAF", slug: "daf", logoUrl: "/BrandsImage/DAF.png" },
        { name: "Ford", slug: "ford", logoUrl: "/BrandsImage/FORD.png" },
        { name: "Ford Otosan", slug: "ford-otosan", logoUrl: "/BrandsImage/FordOtosan.png" },
        { name: "Ford Trucks", slug: "ford-trucks", logoUrl: "/BrandsImage/FordTuck.png" },
        { name: "Iveco", slug: "iveco", logoUrl: "/BrandsImage/Iveco-Otoyol.png" },
        { name: "BMC", slug: "bmc", logoUrl: "/BrandsImage/BMC.png" },
        { name: "Isuzu", slug: "isuzu", logoUrl: "/BrandsImage/Isuzu.png" },
        { name: "Mitsubishi Fuso", slug: "mitsubishi-fuso", logoUrl: "/BrandsImage/MitsubishiFuso.png" },
        { name: "Renault", slug: "renault", logoUrl: "/BrandsImage/Renault.png" },
        { name: "Renault Trucks", slug: "renault-trucks", logoUrl: "/BrandsImage/RenaultTruck.png" },
        { name: "Hyundai", slug: "hyundai", logoUrl: "/BrandsImage/Hyundai.png" },
        { name: "Hino", slug: "hino", logoUrl: "/BrandsImage/Hino.png" },
        { name: "Tata", slug: "tata", logoUrl: "/BrandsImage/Tata.png" },
        { name: "Kenworth", slug: "kenworth", logoUrl: "/BrandsImage/Kenworth.png" },
        { name: "Mack", slug: "mack", logoUrl: "/BrandsImage/Mack.png" },
        { name: "International", slug: "international", logoUrl: "/BrandsImage/International.png" },
        { name: "Sinotruk", slug: "sinotruk", logoUrl: "/BrandsImage/Sinotruk.png" },
        { name: "FAW", slug: "faw", logoUrl: "/BrandsImage/FAW.png" },
        { name: "JAC", slug: "jac", logoUrl: "/BrandsImage/JAC.png" },
        { name: "Dongfeng", slug: "dongfeng", logoUrl: "/BrandsImage/Dongfeng.png" },
        { name: "Tatra", slug: "tatra", logoUrl: "/BrandsImage/Tatra.png" },
        { name: "DFM", slug: "dfm", logoUrl: "/BrandsImage/DFM.png" },
        { name: "Sany", slug: "sany", logoUrl: "/BrandsImage/Sany.png" },
        { name: "Astra", slug: "astra", logoUrl: "/BrandsImage/Astra.png" },
        { name: "Avia", slug: "avia", logoUrl: "/BrandsImage/Avia.png" },
        { name: "MAZ", slug: "maz", logoUrl: "/BrandsImage/MAZ.png" },
        { name: "GAZ", slug: "gaz", logoUrl: "/BrandsImage/GAZ.png" },
        { name: "LIAZ", slug: "liaz", logoUrl: "/BrandsImage/LIAZ.png" },
        { name: "Magirus", slug: "magirus", logoUrl: "/BrandsImage/Magirus.png" },
        { name: "Bedford", slug: "bedford", logoUrl: "/BrandsImage/Bedford.png" },
        { name: "Askam", slug: "askam", logoUrl: "/BrandsImage/Askam.png" },
        { name: "Anadol", slug: "anadol", logoUrl: "/BrandsImage/Anadol.png" },
        // Otobüs markaları
        { name: "Temsa", slug: "temsa", logoUrl: "/BrandsImage/TemsaLogo.png" },
        { name: "Otokar", slug: "otokar", logoUrl: "/BrandsImage/Otokar.png" },
        { name: "Karsan", slug: "karsan", logoUrl: "/BrandsImage/Karsan.png" },
        { name: "Neoplan", slug: "neoplan", logoUrl: "/BrandsImage/Neoplan.png" },
        { name: "Setra", slug: "setra", logoUrl: "/BrandsImage/Setra.png" },
        { name: "Irizar", slug: "irizar", logoUrl: "/BrandsImage/Irizar.png" },
        { name: "Van Hool", slug: "van-hool", logoUrl: "/BrandsImage/VanHool.png" },
        { name: "Viseon", slug: "viseon", logoUrl: "/BrandsImage/Viseon.png" },
        { name: "Habas", slug: "habas", logoUrl: "/BrandsImage/Habas.png" },
        { name: "Gülerüz", slug: "guleruz", logoUrl: "/BrandsImage/guleryuz-logo.png" },
        { name: "Isobus", slug: "isobus", logoUrl: "/BrandsImage/Isobus.png" },
        { name: "Cobus", slug: "cobus", logoUrl: "/BrandsImage/cobus-logo.png" },
        { name: "Beemobs", slug: "beemobs", logoUrl: "/BrandsImage/Beemobs.png" },
        { name: "Mitsubishi Temsa", slug: "mitsubishi-temsa", logoUrl: "/BrandsImage/MitsubishiTemsa.png" },
        // Hafif ticari / Van markaları
        { name: "Volkswagen", slug: "volkswagen", logoUrl: "/BrandsImage/Volkswagen.png" },
        { name: "Fiat", slug: "fiat", logoUrl: "/BrandsImage/Fiat.png" },
        { name: "Peugeot", slug: "peugeot", logoUrl: "/BrandsImage/Peugeot.png" },
        { name: "Citroen", slug: "citroen", logoUrl: "/BrandsImage/Citroen.png" },
        { name: "Opel", slug: "opel", logoUrl: "/BrandsImage/Opel.png" },
        { name: "Dacia", slug: "dacia", logoUrl: "/BrandsImage/Dacia.png" },
        { name: "Kia", slug: "kia", logoUrl: "/BrandsImage/Kia.png" },
        { name: "Toyota", slug: "toyota", logoUrl: "/BrandsImage/Toyota.png" },
        { name: "Nissan", slug: "nissan", logoUrl: "/BrandsImage/nissan.png" },
        { name: "Suzuki", slug: "suzuki", logoUrl: "/BrandsImage/Suzuki.png" },
        { name: "Piaggio", slug: "piaggio", logoUrl: "/BrandsImage/Piaggio.png" },
        { name: "Maxus", slug: "maxus", logoUrl: "/BrandsImage/maxus.png" },
        { name: "SsangYong", slug: "ssangyong", logoUrl: "/BrandsImage/SsangYong-Logo.png" },
        { name: "DFSK", slug: "dfsk", logoUrl: "/BrandsImage/DFSK.png" },
        { name: "Dodge", slug: "dodge", logoUrl: "/BrandsImage/dodge.png" },
        { name: "Chrysler", slug: "chrysler", logoUrl: "/BrandsImage/Chrysler.png" },
        { name: "Daewoo", slug: "daewoo", logoUrl: "/BrandsImage/Daewoo.png" },
        { name: "Daihatsu", slug: "daihatsu", logoUrl: "/BrandsImage/Daihatsu.png" },
        { name: "Mazda", slug: "mazda", logoUrl: "/BrandsImage/mazda.png" },
        { name: "Samsung", slug: "samsung", logoUrl: "/BrandsImage/Samsung.png" },
        { name: "Skoda", slug: "skoda", logoUrl: "/BrandsImage/Skoda.png" },
        // Özel markalar
        { name: "Turkkar", slug: "turkkar", logoUrl: "/BrandsImage/Turkkar.png" },
        { name: "Tezeller", slug: "tezeller", logoUrl: "/BrandsImage/Tezeller.png" },
        { name: "Tenax", slug: "tenax", logoUrl: "/BrandsImage/Tenax.png" },
        { name: "TCV", slug: "tcv", logoUrl: "/BrandsImage/TCV.png" },
        { name: "Ortimobil", slug: "ortimobil", logoUrl: "/BrandsImage/Ortimobil.png" },
        { name: "Pilotcar", slug: "pilotcar", logoUrl: "/BrandsImage/Pilotcar.png" },
        { name: "Regis", slug: "regis", logoUrl: "/BrandsImage/Regis.png" },
        { name: "GreenCar", slug: "greencar", logoUrl: "/BrandsImage/GreenCar.png" },
        { name: "Cenntro", slug: "cenntro", logoUrl: "/BrandsImage/Cenntro.png" },
        { name: "Runhorse", slug: "runhorse", logoUrl: "/BrandsImage/Runhorse.png" },
        { name: "HF Kanuni", slug: "hf-kanuni", logoUrl: "/BrandsImage/HFKanuni.png" },
        { name: "Kuba", slug: "kuba", logoUrl: "/BrandsImage/kuba.png" },
        { name: "Lada", slug: "lada", logoUrl: "/BrandsImage/lada.png" },
        { name: "Proton", slug: "proton", logoUrl: "/BrandsImage/Proton.png" },
        { name: "Shifeng", slug: "shifeng", logoUrl: "/BrandsImage/Shifeng.png" },
        { name: "Victory", slug: "victory", logoUrl: "/BrandsImage/Victory.png" },
        { name: "Aixam", slug: "aixam", logoUrl: "/BrandsImage/Aixam.png" },
        { name: "Axiam", slug: "axiam", logoUrl: "/BrandsImage/Axiam.png" },
        { name: "Alke", slug: "alke", logoUrl: "/BrandsImage/Alke.png" },
        { name: "Akeso", slug: "akeso", logoUrl: "/BrandsImage/Akeso.png" },
        { name: "AKIA", slug: "akia", logoUrl: "/BrandsImage/AKIA.png" },
        { name: "Breda", slug: "breda", logoUrl: "/BrandsImage/Breda.png" },
        { name: "CMC", slug: "cmc", logoUrl: "/BrandsImage/CMC.png" },
        { name: "Junda", slug: "junda", logoUrl: "/BrandsImage/Junda.png" },
        { name: "Musatti", slug: "musatti", logoUrl: "/BrandsImage/Musatti.png" },
        // Dorse alt-tip "marka" görselleri (kategori içi kullanım)
        { name: "Damperli", slug: "damperli", logoUrl: "/BrandsImage/Damperli.png" },
        { name: "Kuruyük", slug: "kuruyuk", logoUrl: "/BrandsImage/Kuruyük.png" },
        { name: "Lowbed", slug: "lowbed", logoUrl: "/BrandsImage/Lowbed.png" },
        { name: "Silobas", slug: "silobas", logoUrl: "/BrandsImage/Silobas.png" },
        { name: "Tanker", slug: "tanker", logoUrl: "/BrandsImage/Tanker.png" },
        { name: "Tekstil", slug: "tekstil", logoUrl: "/BrandsImage/tekstil.png" },
        { name: "Tenteli", slug: "tenteli", logoUrl: "/BrandsImage/Tenteli.png" },
        { name: "Frigorifik", slug: "frigorifik", logoUrl: "/BrandsImage/Frigofirik.png" },
        { name: "Konteyner Taşıyıcı & Şasi Grubu", slug: "konteyner-tasiyici-sasi-grubu", logoUrl: "/BrandsImage/Konteyner-Tasiyici-Sasi-Grubu.png" },
        { name: "Sabit Kabin", slug: "sabit-kabin", logoUrl: "/BrandsImage/Sabit Kabin.png" },
        // Oto Kurtarıcı alt-tip
        { name: "Tekli Araç", slug: "tekli-arac", logoUrl: "/BrandsImage/Tekli Arac.png" },
        { name: "Çoklu Araç", slug: "coklu-arac", logoUrl: "/BrandsImage/Coklu Arac.png" },
        // Römork alt-tip
        { name: "Kamyon Römorkları", slug: "kamyon-rumorklari", logoUrl: "/BrandsImage/Kamyon Römorkları Tasarımı.png" },
        { name: "Tarım Römorklar", slug: "tarim-romorklar", logoUrl: "/BrandsImage/Tarım Römorklar.png" },
        { name: "Taşıma Römorklar", slug: "tasima-romorklar", logoUrl: "/BrandsImage/Taşıma Römorklar.png" },
        { name: "Özel Amaçlı Römorklar", slug: "ozel-amacli-romorklar", logoUrl: "/BrandsImage/Özel Amaçlı Römorklar.png" },
        // Diğer
        { name: "Diğer", slug: "diger", logoUrl: "/BrandsImage/DigerMarkalar.png" },
    ];

    const brandMap: Record<string, number> = {};
    for (const b of brandData) {
        const brand = await prisma.brand.upsert({
            where: { slug: b.slug },
            update: {},
            create: { name: b.name, slug: b.slug, logoUrl: b.logoUrl },
        });
        brandMap[b.slug] = brand.id;
    }
    console.log(`  ✅ ${brandData.length} brands created`);

    // ==========================================
    // 3. CATEGORY-BRAND MAPPINGS
    // ==========================================
    console.log("🔗 Creating category-brand mappings...");

    const categoryBrandMap: Record<string, string[]> = {
        cekici: [
            "mercedes", "volvo", "man", "scania", "daf", "ford", "ford-otosan", "ford-trucks",
            "iveco", "bmc", "isuzu", "renault-trucks", "hyundai", "hino", "tata", "kenworth",
            "mack", "international", "sinotruk", "faw", "jac", "dongfeng", "tatra", "astra",
            "maz", "gaz", "magirus", "bedford", "askam", "diger",
        ],
        dorse: [
            "damperli", "kuruyuk", "lowbed", "silobas", "tanker", "tekstil", "tenteli",
            "frigorifik", "konteyner-tasiyici-sasi-grubu", "diger",
        ],
        "kamyon-kamyonet": [
            "mercedes", "volvo", "man", "scania", "daf", "ford", "ford-otosan", "ford-trucks",
            "iveco", "bmc", "isuzu", "mitsubishi-fuso", "renault", "renault-trucks", "hyundai",
            "hino", "tata", "sinotruk", "faw", "jac", "dongfeng", "tatra", "dfm", "astra",
            "maz", "gaz", "liaz", "magirus", "bedford", "askam", "anadol", "diger",
        ],
        "karoser-ust-yapi": [
            "damperli", "sabit-kabin", "diger",
        ],
        "minibus-midibus": [
            "mercedes", "ford", "ford-otosan", "isuzu", "karsan", "otokar", "hyundai", "toyota",
            "volkswagen", "bmc", "mitsubishi-fuso", "mitsubishi-temsa", "temsa", "iveco",
            "renault", "fiat", "peugeot", "citroen", "opel", "kia", "diger",
        ],
        otobus: [
            "mercedes", "man", "temsa", "otokar", "bmc", "neoplan", "setra", "irizar",
            "van-hool", "viseon", "habas", "guleruz", "isobus", "cobus", "beemobs",
            "volvo", "scania", "iveco", "hyundai", "mitsubishi-temsa", "karsan", "diger",
        ],
        "oto-kurtarici-tasiyici": [
            "tekli-arac", "coklu-arac",
        ],
        romork: [
            "kamyon-rumorklari", "tarim-romorklar", "tasima-romorklar", "ozel-amacli-romorklar",
        ],
        "minivan-panelvan": [
            "volkswagen", "ford", "ford-otosan", "fiat", "peugeot", "citroen", "renault",
            "mercedes", "opel", "hyundai", "kia", "toyota", "nissan", "dacia", "suzuki",
            "piaggio", "maxus", "ssangyong", "dfsk", "dodge", "chrysler", "isuzu", "diger",
        ],
    };

    let cbCount = 0;
    for (const [catSlug, brandSlugs] of Object.entries(categoryBrandMap)) {
        const catId = catMap[catSlug];
        if (!catId) continue;
        for (const bSlug of brandSlugs) {
            const bId = brandMap[bSlug];
            if (!bId) continue;
            await prisma.categoryBrand.upsert({
                where: { categoryId_brandId: { categoryId: catId, brandId: bId } },
                update: {},
                create: { categoryId: catId, brandId: bId },
            });
            cbCount++;
        }
    }
    console.log(`  ✅ ${cbCount} category-brand mappings created`);

    // ==========================================
    // 4. CITIES (81 il)
    // ==========================================
    console.log("🏙️  Creating cities...");

    const cityData: [string, string][] = [
        ["01", "Adana"], ["02", "Adıyaman"], ["03", "Afyonkarahisar"], ["04", "Ağrı"],
        ["05", "Amasya"], ["06", "Ankara"], ["07", "Antalya"], ["08", "Artvin"],
        ["09", "Aydın"], ["10", "Balıkesir"], ["11", "Bilecik"], ["12", "Bingöl"],
        ["13", "Bitlis"], ["14", "Bolu"], ["15", "Burdur"], ["16", "Bursa"],
        ["17", "Çanakkale"], ["18", "Çankırı"], ["19", "Çorum"], ["20", "Denizli"],
        ["21", "Diyarbakır"], ["22", "Edirne"], ["23", "Elazığ"], ["24", "Erzincan"],
        ["25", "Erzurum"], ["26", "Eskişehir"], ["27", "Gaziantep"], ["28", "Giresun"],
        ["29", "Gümüşhane"], ["30", "Hakkari"], ["31", "Hatay"], ["32", "Isparta"],
        ["33", "Mersin"], ["34", "İstanbul"], ["35", "İzmir"], ["36", "Kars"],
        ["37", "Kastamonu"], ["38", "Kayseri"], ["39", "Kırklareli"], ["40", "Kırşehir"],
        ["41", "Kocaeli"], ["42", "Konya"], ["43", "Kütahya"], ["44", "Malatya"],
        ["45", "Manisa"], ["46", "Kahramanmaraş"], ["47", "Mardin"], ["48", "Muğla"],
        ["49", "Muş"], ["50", "Nevşehir"], ["51", "Niğde"], ["52", "Ordu"],
        ["53", "Rize"], ["54", "Sakarya"], ["55", "Samsun"], ["56", "Siirt"],
        ["57", "Sinop"], ["58", "Sivas"], ["59", "Tekirdağ"], ["60", "Tokat"],
        ["61", "Trabzon"], ["62", "Tunceli"], ["63", "Şanlıurfa"], ["64", "Uşak"],
        ["65", "Van"], ["66", "Yozgat"], ["67", "Zonguldak"], ["68", "Aksaray"],
        ["69", "Bayburt"], ["70", "Karaman"], ["71", "Kırıkkale"], ["72", "Batman"],
        ["73", "Şırnak"], ["74", "Bartın"], ["75", "Ardahan"], ["76", "Iğdır"],
        ["77", "Yalova"], ["78", "Karabük"], ["79", "Kilis"], ["80", "Osmaniye"],
        ["81", "Düzce"],
    ];

    const cityMap: Record<string, number> = {};
    for (const [plate, name] of cityData) {
        const city = await prisma.city.upsert({
            where: { plateCode: plate },
            update: {},
            create: { name, plateCode: plate },
        });
        cityMap[plate] = city.id;
    }
    console.log(`  ✅ ${cityData.length} cities created`);

    // ==========================================
    // 5. DISTRICTS (büyük şehirler)
    // ==========================================
    console.log("🏘️  Creating districts...");

    const districtData: Record<string, string[]> = {
        "34": [ // İstanbul
            "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler",
            "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü",
            "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
            "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane",
            "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
            "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla",
            "Ümraniye", "Üsküdar", "Zeytinburnu",
        ],
        "06": [ // Ankara
            "Akyurt", "Altındağ", "Ayaş", "Balâ", "Beypazarı", "Çamlıdere", "Çankaya",
            "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana",
            "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan",
            "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle",
        ],
        "35": [ // İzmir
            "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova",
            "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe",
            "Karabağlar", "Karşıyaka", "Karaburun", "Kemalpaşa", "Kınık", "Kiraz",
            "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar",
            "Selçuk", "Tire", "Torbalı", "Urla",
        ],
        "16": [ // Bursa
            "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey",
            "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli",
            "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım",
        ],
        "07": [ // Antalya
            "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike",
            "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı",
            "Kumluca", "Manavgat", "Muratpaşa", "Serik",
        ],
        "01": [ // Adana
            "Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş",
            "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir",
        ],
        "42": [ // Konya
            "Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli",
            "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli",
            "Güneysınır", "Hadım", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar",
            "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent",
            "Tuzlukçu", "Yalıhüyük", "Yunak",
        ],
        "27": [ // Gaziantep
            "Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli",
        ],
        "33": [ // Mersin
            "Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar",
            "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir",
        ],
        "41": [ // Kocaeli
            "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük",
            "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez",
        ],
        "21": [ // Diyarbakır
            "Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani",
            "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir",
        ],
        "38": [ // Kayseri
            "Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan",
            "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza",
            "Yahyalı", "Yeşilhisar",
        ],
        "55": [ // Samsun
            "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba",
            "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme",
            "Vezirköprü", "Yakakent", "19 Mayıs",
        ],
    };

    let distCount = 0;
    for (const [plate, districts] of Object.entries(districtData)) {
        const cId = cityMap[plate];
        if (!cId) continue;
        for (const dName of districts) {
            const existing = await prisma.district.findFirst({
                where: { cityId: cId, name: dName },
            });
            if (!existing) {
                await prisma.district.create({ data: { cityId: cId, name: dName } });
            }
            distCount++;
        }
    }
    console.log(`  ✅ ${distCount} districts created`);

    // ==========================================
    // 6. SITE SETTINGS
    // ==========================================
    console.log("⚙️  Creating site settings...");
    await prisma.siteSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            sloganLeft: "Alın Satın",
            sloganRight: "ile Mutlu Kalın",
            showcaseTitle: "Vitrin",
            searchPlaceholder: "Araç, marka, model, konum, ilan no ara...",
            showExampleBadge: true,
            exampleBadgeText: "ÖRNEKTİR",
            exampleBadgeColor: "#ff5722",
            cardPriceColor: "#dc3545",
            adsPerPage: 1000,
            primaryColor: "#D34237",
            headerBgColor: "#D7D7D5",
            footerBgColor: "#E8E8E8",
            contactEmail: "info@trucksbus.com.tr",
            contactAddress: "İçerenköy Mahallesi, Ataşehir, İstanbul",
            footerText: "Tüm hakları saklıdır.",
            siteTitle: "TrucksBus - Ağır Ticari Araç Alım Satım",
            siteDescription: "Kamyon, çekici, otobüs, minibüs, dorse alım satım platformu",
            maintenanceMode: false,
            maintenanceMsg: "Site bakım modundadır. Lütfen daha sonra tekrar deneyiniz.",
            announcementColor: "#1976d2",
            showAnnouncement: false,
        },
    });
    console.log("  ✅ Site settings created");

    // ==========================================
    // 7. DOPING PACKAGES
    // ==========================================
    console.log("💎 Creating doping packages...");
    const dopingPackages = [
        { name: "Öne Çıkarma", description: "İlanınızı listenin üst sırasına çıkarın", features: ["7 gün boyunca öne çıkarma", "Arama sonuçlarında üst sıra", "Daha fazla görüntülenme"], price: 0, originalPrice: 99, duration: 7, icon: "star", color: "#FF6B6B" },
        { name: "Vitrin İlanı", description: "İlanınızı vitrine yerleştirin", features: ["15 gün vitrin ilanı", "Ana sayfada görünürlük", "Özel vitrin rozeti"], price: 0, originalPrice: 199, duration: 15, icon: "crown", color: "#FFD700" },
        { name: "Acil İlan", description: "İlanınızı acil olarak işaretleyin", features: ["10 gün acil ilan etiketi", "Öncelikli listeleme", "Dikkat çekici rozet"], price: 0, originalPrice: 149, duration: 10, icon: "flash", color: "#FF4757" },
        { name: "Premium İlan", description: "En üst düzey görünürlük", features: ["30 gün premium görünürlük", "Tüm sayfalarda öne çıkarma", "VIP destek", "Analitik raporlar"], price: 0, originalPrice: 299, duration: 30, icon: "rocket", color: "#3742FA" },
        { name: "Spotlight", description: "Spotlight ile parlatın", features: ["3 gün spotlight", "Kategori sayfasında öne çıkma"], price: 0, originalPrice: 79, duration: 3, icon: "sun", color: "#FFA726" },
        { name: "Elmas İlan", description: "En prestijli ilan paketi", features: ["30 gün elmas ilan", "Tüm platformda en üst görünürlük", "Özel elmas rozeti", "7/24 VIP destek"], price: 0, originalPrice: 499, duration: 30, icon: "diamond", color: "#9C27B0" },
    ];

    for (const dp of dopingPackages) {
        const existing = await prisma.dopingPackage.findUnique({ where: { name: dp.name } });
        if (!existing) {
            await prisma.dopingPackage.create({ data: dp });
        }
    }
    console.log(`  ✅ ${dopingPackages.length} doping packages created`);

    // ==========================================
    // 8. ADMIN USER
    // ==========================================
    console.log("👤 Creating admin user...");
    const adminExists = await prisma.user.findUnique({ where: { email: "admin@trucksbus.com.tr" } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash("Admin1234!", 10);
        await prisma.user.create({
            data: {
                email: "admin@trucksbus.com.tr",
                passwordHash: hashedPassword,
                firstName: "Admin",
                lastName: "TrucksBus",
                role: "ADMIN",
                isVerified: true,
                isActive: true,
                kvkkAccepted: true,
                kvkkAcceptedAt: new Date(),
            },
        });
        console.log("  ✅ Admin user created (admin@trucksbus.com.tr / Admin1234!)");
    } else {
        console.log("  ⏭️  Admin user already exists");
    }

    console.log("\n🎉 Seeding complete!");
    console.log("============================");
    console.log("Admin: admin@trucksbus.com.tr / Admin1234!");
    console.log("============================");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
