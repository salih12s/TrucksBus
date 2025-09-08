const apiClient = require('./server/src/config/axios');

async function testDorseFormSubmission() {
    console.log('🚛 Dorse form gönderimi test ediliyor...');
    
    try {
        // Test verileri hazırla
        const formData = new FormData();
        
        formData.append('title', 'Test Dorse İlanı');
        formData.append('description', 'Test açıklaması');
        formData.append('year', '2020');
        formData.append('price', '150000');
        formData.append('genislik', '2.5');
        formData.append('uzunluk', '6.0');
        formData.append('lastikDurumu', '90');
        formData.append('devrilmeYonu', 'Arkaya');
        formData.append('cityId', '1');
        formData.append('districtId', '1');
        formData.append('sellerName', 'Test Satıcı');
        formData.append('phone', '05551234567');
        formData.append('email', 'test@example.com');
        formData.append('warranty', 'evet');
        formData.append('negotiable', 'hayir');
        formData.append('exchange', 'hayir');
        formData.append('detailedInfo', 'Detaylı test bilgisi');
        formData.append('categorySlug', 'dorse');
        formData.append('brandSlug', 'damperli');
        formData.append('modelSlug', 'test-model');
        formData.append('variantSlug', 'hafriyat-tip');
        
        const response = await fetch('http://localhost:5000/api/ads/dorse', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer test_token'
            }
        });
        
        const result = await response.json();
        console.log('✅ Response:', result);
        
        if (response.ok) {
            console.log('🎉 Dorse form başarıyla gönderildi!');
        } else {
            console.log('❌ Hata:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test hatası:', error.message);
    }
}

testDorseFormSubmission();
