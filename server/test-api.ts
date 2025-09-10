import fetch from "node-fetch";

async function testAPI() {
  try {
    // Test provinces
    const provincesResponse = await fetch(
      "https://turkiyeapi.dev/api/v1/provinces"
    );
    const provincesData = (await provincesResponse.json()) as any;

    console.log("Provinces API structure:");
    console.log("Total provinces:", provincesData.data.length);
    console.log("Sample province:");
    console.log(JSON.stringify(provincesData.data[0], null, 2));

    // Test districts
    const districtsResponse = await fetch(
      "https://turkiyeapi.dev/api/v1/districts"
    );
    const districtsData = (await districtsResponse.json()) as any;

    console.log("\nDistricts API structure:");
    console.log("Total districts:", districtsData.data.length);
    console.log("Sample district:");
    console.log(JSON.stringify(districtsData.data[0], null, 2));

    // Check province_id in first 5 districts
    console.log("\nFirst 5 districts province_id values:");
    for (let i = 0; i < 5; i++) {
      const district = districtsData.data[i];
      console.log(`${district.name}: province_id = ${district.province_id}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testAPI();
