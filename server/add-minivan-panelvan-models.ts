import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚐 Minivan ve Panelvan modelleri ekleniyor...\n");

  // Kategoriyi bul
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "minivan-panelvan" }, { name: { contains: "Minivan" } }],
    },
  });

  if (!category) {
    throw new Error("❌ Minivan & Panelvan kategorisi bulunamadı!");
  }

  console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})\n`);

  let totalModels = 0;
  let totalVariants = 0;

  // ========== ISUZU ==========
  const isuzu = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "isuzu" },
        { name: { equals: "Isuzu", mode: "insensitive" } },
      ],
    },
  });

  if (isuzu) {
    console.log(`\n📦 ${isuzu.name.toUpperCase()} modelleri ekleniyor...`);

    const isuzuModels = [
      {
        name: "WFR",
        variants: ["1.8", "2.0", "2.4"],
      },
    ];

    for (const modelData of isuzuModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: isuzu.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: isuzu.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== IVECO ==========
  const iveco = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "iveco" },
        { name: { equals: "Iveco", mode: "insensitive" } },
      ],
    },
  });

  if (iveco) {
    console.log(`\n📦 ${iveco.name.toUpperCase()} modelleri ekleniyor...`);

    const ivecoModels = [
      {
        name: "35",
        variants: [
          "c10 Daily van",
          "c11 Daily van",
          "c12 Daily van",
          "c13 Daily van",
          "c15 Daily van",
          "c16 Daily van",
          "c18 Daily van",
          "s11 Daily van",
          "s13 Daily van",
          "s14 Daily van",
          "s15 Daily van",
          "s16 Daily van",
          "s35 Daily van",
        ],
      },
      {
        name: "40",
        variants: ["c15 Daily van"],
      },
      {
        name: "50",
        variants: ["c13 Daily van", "c15 Daily van"],
      },
      {
        name: "70",
        variants: ["Daily van"],
      },
    ];

    for (const modelData of ivecoModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: iveco.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: iveco.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== KIA ==========
  const kia = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: "kia" }, { name: { equals: "Kia", mode: "insensitive" } }],
    },
  });

  if (kia) {
    console.log(`\n📦 ${kia.name.toUpperCase()} modelleri ekleniyor...`);

    const kiaModels = [
      {
        name: "Asia",
        variants: ["Tower"],
      },
      {
        name: "Besta",
        variants: ["2.2", "2.7 Hi"],
      },
      {
        name: "Joice",
        variants: ["2.0"],
      },
      {
        name: "Pregia",
        variants: ["120 DLX", "150 DLX", "3 panel van", "panel van DLX"],
      },
    ];

    for (const modelData of kiaModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: kia.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: kia.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== LANCIA ==========
  const lancia = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "lancia" },
        { name: { equals: "Lancia", mode: "insensitive" } },
      ],
    },
  });

  if (lancia) {
    console.log(`\n📦 ${lancia.name.toUpperCase()} modelleri ekleniyor...`);

    const lanciaModels = [
      {
        name: "Voyager",
        variants: ["2.8 CRD", "3.6"],
      },
    ];

    for (const modelData of lanciaModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: lancia.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: lancia.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== LDV ==========
  const ldv = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: "ldv" }, { name: { equals: "LDV", mode: "insensitive" } }],
    },
  });

  if (ldv) {
    console.log(`\n📦 ${ldv.name.toUpperCase()} modelleri ekleniyor...`);

    const ldvModels = [
      {
        name: "Convoy",
        variants: ["2.5"],
      },
    ];

    for (const modelData of ldvModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: ldv.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: ldv.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== MAN ==========
  const man = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: "man" }, { name: { equals: "Man", mode: "insensitive" } }],
    },
  });

  if (man) {
    console.log(`\n📦 ${man.name.toUpperCase()} modelleri ekleniyor...`);

    const manModels = [
      {
        name: "TGE",
        variants: ["3.140", "3.180", "5.180"],
      },
    ];

    for (const modelData of manModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: man.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: man.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== MAXUS ==========
  const maxus = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "maxus" },
        { name: { equals: "Maxus", mode: "insensitive" } },
      ],
    },
  });

  if (maxus) {
    console.log(`\n📦 ${maxus.name.toUpperCase()} modelleri ekleniyor...`);

    const maxusModels = [
      {
        name: "Deliver 7",
        variants: ["2.0"],
      },
      {
        name: "Deliver 9",
        variants: ["2.0"],
      },
      {
        name: "E-deliver",
        variants: ["E-deliver 3", "E-deliver 5", "E-deliver 7", "E-deliver 9"],
      },
      {
        name: "EV30",
        variants: ["L"],
      },
    ];

    for (const modelData of maxusModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: maxus.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: maxus.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== MAZDA ==========
  const mazda = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "mazda" },
        { name: { equals: "Mazda", mode: "insensitive" } },
      ],
    },
  });

  if (mazda) {
    console.log(`\n📦 ${mazda.name.toUpperCase()} modelleri ekleniyor...`);

    const mazdaModels = [
      {
        name: "E 2200",
        variants: ["Glass van hd", "Panel van"],
      },
    ];

    for (const modelData of mazdaModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: mazda.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: mazda.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== MITSUBISHI ==========
  const mitsubishi = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "mitsubishi" },
        { name: { equals: "Mitsubishi", mode: "insensitive" } },
      ],
    },
  });

  if (mitsubishi) {
    console.log(`\n📦 ${mitsubishi.name.toUpperCase()} modelleri ekleniyor...`);

    const mitsubishiModels = [
      {
        name: "L300",
        variants: ["L300 camlı van", "L300 city van", "L300 panel"],
      },
      {
        name: "L400",
        variants: ["2.4"],
      },
    ];

    for (const modelData of mitsubishiModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: mitsubishi.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: mitsubishi.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  // ========== NISSAN ==========
  const nissan = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "nissan" },
        { name: { equals: "Nissan", mode: "insensitive" } },
      ],
    },
  });

  if (nissan) {
    console.log(`\n📦 ${nissan.name.toUpperCase()} modelleri ekleniyor...`);

    const nissanModels = [
      {
        name: "Townstar",
        variants: ["1.3 TCe"],
      },
      {
        name: "Townstar EV",
        variants: ["Designpack", "Platinium", "Tekna", "Tekna Plus"],
      },
      {
        name: "Elgrand",
        variants: ["3.0 TDi"],
      },
      {
        name: "Presage",
        variants: ["2.5", "3.0", "3.5"],
      },
      {
        name: "Primastar",
        variants: ["1.9 DCi", "2.0 DCi", "2.5 DCi"],
      },
      {
        name: "Serena",
        variants: ["2.0 SLX"],
      },
      {
        name: "Urvan",
        variants: ["2.0", "2.4", "2.5"],
      },
      {
        name: "Vanette",
        variants: ["2.0", "2.3 Cargo"],
      },
    ];

    for (const modelData of nissanModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: nissan.id,
          categoryId: category.id,
        },
      });

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: modelData.name,
            slug: modelData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            brandId: nissan.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

      for (const variantName of modelData.variants) {
        const existingVariant = await prisma.variant.findFirst({
          where: {
            name: variantName,
            modelId: model.id,
          },
        });

        if (!existingVariant) {
          await prisma.variant.create({
            data: {
              name: variantName,
              slug: variantName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
              modelId: model.id,
            },
          });
          console.log(`    ✅ Varyant eklendi: ${variantName}`);
          totalVariants++;
        } else {
          console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
        }
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 TOPLAM ÖZET:");
  console.log(`   Yeni eklenen model sayısı: ${totalModels}`);
  console.log(`   Yeni eklenen varyant sayısı: ${totalVariants}`);
  console.log("=".repeat(50));
  console.log("\n✅ Tüm Minivan ve Panelvan modelleri başarıyla eklendi!\n");
}

main()
  .catch((e) => {
    console.error("❌ Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
