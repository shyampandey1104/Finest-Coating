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
const targetImage = '/Users/shyamkumarpandey/Downloads/Sensor-Operated-Urinals.jpg';

async function uploadUrinalHero() {
    try {
        console.log('🚀 Starting Urinal Hero upload...');

        if (!fs.existsSync(targetImage)) {
            console.error('❌ File not found:', targetImage);
            return;
        }

        // Upload to Cloudinary
        console.log('Uploading image...');
        const result = await cloudinary.uploader.upload(targetImage, {
            folder: 'Finest Coating/Urinals',
            resource_type: 'image'
        });

        console.log('✅ Uploaded:', result.secure_url);

        // Update images.json
        const images = JSON.parse(fs.readFileSync(IMAGES_JSON_PATH, 'utf8'));

        if (!images.urinals) images.urinals = [];

        // Add to the START of the array so it becomes the main image
        images.urinals.unshift(result.secure_url);

        fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(images, null, 2));
        console.log('✅ images.json updated! Image set as main Urinal image.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadUrinalHero();
