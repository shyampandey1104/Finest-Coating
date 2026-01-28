const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration
cloudinary.config({
    cloud_name: 'dd2sbrcrr',
    api_key: '173777767114771',
    api_secret: 'vcbZWirynnzsfWAlOgg-Jg6Xyqg'
});

const IMAGES_JSON_PATH = path.join(__dirname, 'images.json');
const targetImage = '/Users/shyamkumarpandey/Downloads/WhatsApp Image 2026-01-11 at 11.25.45 PM.jpeg';

async function uploadKitchenHero() {
    try {
        console.log('🚀 Starting Kitchen Hero upload...');

        if (!fs.existsSync(targetImage)) {
            console.error('❌ File not found:', targetImage);
            return;
        }

        // Upload to Cloudinary
        console.log('Uploading image...');
        const result = await cloudinary.uploader.upload(targetImage, {
            folder: 'Finest Coating/Kitchen',
            resource_type: 'image'
        });

        console.log('✅ Uploaded:', result.secure_url);

        // Update images.json
        const images = JSON.parse(fs.readFileSync(IMAGES_JSON_PATH, 'utf8'));

        if (!images.services) images.services = [];

        // Ensure services array has at least 2 elements and set index 1 (Kitchen main)
        while (images.services.length < 2) {
            images.services.push('placeholder');
        }
        images.services[1] = result.secure_url;

        // Also add to kitchen gallery slider at the start
        if (!images.kitchen) images.kitchen = [];
        images.kitchen.unshift(result.secure_url);

        fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(images, null, 2));
        console.log('✅ images.json updated! Image set as main Kitchen image.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadKitchenHero();
