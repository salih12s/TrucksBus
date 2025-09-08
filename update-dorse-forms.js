// Dorse formlarını güncellemek için script
// KapakliTipForm ve KayaTipiForm'u HafriyatTipiForm ile aynı standarda getirmek için

const fs = require('fs');
const path = require('path');

const formsToUpdate = [
  'KapakliTipForm.tsx',
  'KayaTipiForm.tsx'
];

const baseDir = 'c:\\Users\\salih\\Desktop\\TrucksBusV2\\client\\src\\components\\forms\\Damperli';

// Her form için güncellemeleri uygula
formsToUpdate.forEach(formName => {
  const formPath = path.join(baseDir, formName);
  
  try {
    let content = fs.readFileSync(formPath, 'utf8');
    
    console.log(`${formName} güncelleniyor...`);
    
    // User state'i ekle
    if (!content.includes('const [user, setUser] = useState<User | null>(null);')) {
      content = content.replace(
        /const \[submitSuccess, setSubmitSuccess\] = useState\(false\);/,
        `const [submitSuccess, setSubmitSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);`
      );
    }
    
    // User auto-fetch fonksiyonu ekle
    if (!content.includes('// Kullanıcı bilgilerini yükle')) {
      content = content.replace(
        /\/\/ Şehirleri yükle/,
        `// Kullanıcı bilgilerini yükle
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get("/auth/profile");
        const userData = response.data as User;
        setUser(userData);
        
        // Form verilerini kullanıcı bilgileriyle doldur
        setFormData((prev) => ({
          ...prev,
          sellerName: userData.fullName || "",
          phone: userData.phone || "",
          email: userData.email || "",
        }));
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
      }
    };
    fetchUser();
  }, []);

  // Şehirleri yükle`
      );
    }
    
    console.log(`${formName} güncellendi!`);
    
  } catch (error) {
    console.error(`${formName} güncellenirken hata:`, error.message);
  }
});

console.log('Tüm Dorse formları güncellendi!');
