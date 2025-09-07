import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

interface District {
  id: number;
  name: string;
}

interface Province {
  id: number;
  name: string;
  population: number;
  area: number;
  altitude: number;
  areaCode: number[];
  isCoastal: boolean;
  isMetropolitan: boolean;
  districts: District[];
}

interface ApiResponse {
  status: string;
  data: Province[];
}

async function seedCitiesDistricts() {
  try {
    console.log("🌍 turkiyeapi.dev'den il ve ilçe verileri çekiliyor...");

    // Türkiye API'sinden tüm illeri ve ilçeleri çek
    const response = await fetch("https://turkiyeapi.dev/api/v1/provinces");

    if (!response.ok) {
      throw new Error(`API isteği başarısız: ${response.status}`);
    }

    const apiData = (await response.json()) as ApiResponse;

    console.log(
      "🔍 API yanıtı:",
      JSON.stringify(apiData, null, 2).substring(0, 1000) + "..."
    );

    if (apiData.status !== "OK") {
      throw new Error("API'den başarısız yanıt geldi");
    }

    const provinces: Province[] = apiData.data;

    console.log(`📊 ${provinces.length} il bulundu, veritabanına ekleniyor...`);
    console.log("🔍 İlk il örneği:", JSON.stringify(provinces[0], null, 2));

    let totalCitiesAdded = 0;
    let totalDistrictsAdded = 0;

    for (const provinceData of provinces) {
      try {
        // Önce il var mı kontrol et
        const existingCity = await prisma.city.findFirst({
          where: { plateCode: provinceData.id.toString() },
        });

        if (existingCity) {
          console.log(
            `⚠️ ${provinceData.name} (${provinceData.id}) zaten mevcut, atlanıyor...`
          );
          continue;
        }

        // İl oluştur
        const city = await prisma.city.create({
          data: {
            name: provinceData.name,
            plateCode: provinceData.id.toString(),
          },
        });

        totalCitiesAdded++;

        // İlçeleri oluştur
        if (provinceData.districts && provinceData.districts.length > 0) {
          for (const district of provinceData.districts) {
            await prisma.district.create({
              data: {
                name: district.name,
                cityId: city.id,
              },
            });
            totalDistrictsAdded++;
          }
        }

        console.log(
          `✅ ${provinceData.name} (${provinceData.id}) ve ${
            provinceData.districts?.length || 0
          } ilçesi eklendi`
        );

        // Her 10 ilde bir kısa duraklama (API rate limiting için)
        if (totalCitiesAdded % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ ${provinceData.name} eklenirken hata:`, error);
      }
    }

    console.log("🎉 Tüm il ve ilçe verileri başarıyla eklendi!");

    // Özet bilgi
    const totalCities = await prisma.city.count();
    const totalDistricts = await prisma.district.count();
    console.log(
      `📈 Veritabanında toplam: ${totalCities} il, ${totalDistricts} ilçe`
    );
    console.log(
      `➕ Bu işlemde eklenen: ${totalCitiesAdded} il, ${totalDistrictsAdded} ilçe`
    );
  } catch (error) {
    console.error("❌ İl ve İlçe verileri eklenirken genel hata:", error);

    if (error instanceof Error) {
      console.error("Hata detayı:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  seedCitiesDistricts();
}

export default seedCitiesDistricts;
