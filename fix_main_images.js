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
const uploadedImage1 = '/Users/shyamkumarpandey/.gemini/antigravity/brain/5cb3d141-e8b1-423d-a831-26c2a53b4c35/uploaded_image_0_1769615043791.png'; // Urinals Main
const uploadedImage2 = '/Users/shyamkumarpandey/.gemini/antigravity/brain/5cb3d141-e8b1-423d-a831-26c2a53b4c35/uploaded_image_1_1769615043791.png'; // Kitchen Main

async function uploadAndFix() {
    try {
        console.log('🚀 Starting fixed upload process...');
        const images = JSON.parse(fs.readFileSync(IMAGES_JSON_PATH, 'utf8'));

        // 1. Upload Urinals Main Image
        if (fs.existsSync(uploadedImage1)) {
            console.log('Uploading Urinals main image...');
            const result1 = await cloudinary.uploader.upload(uploadedImage1, {
                folder: 'Finest Coating/Urinals',
                resource_type: 'image'
            });
            console.log('✅ Urinals Uploaded:', result1.secure_url);

            // Insert at index 0 of urinals array
            if (!images.urinals) images.urinals = [];
            images.urinals.unshift(result1.secure_url);
        } else {
            console.log('❌ Urinals image file not found at path');
        }

        // 2. Upload Kitchen Main Image
        // The HTML uses data.services[1] for the kitchen main image.
        if (fs.existsSync(uploadedImage2)) {
            console.log('Uploading Kitchen main image...');
            const result2 = await cloudinary.uploader.upload(uploadedImage2, {
                folder: 'Finest Coating/Services',
                resource_type: 'image'
            });
            console.log('✅ Kitchen Uploaded:', result2.secure_url);

            // Ensure services array has at least 2 elements
            if (!images.services) images.services = [];
            while (images.services.length < 2) {
                images.services.push('placeholder');
            }
            images.services[1] = result2.secure_url;
        } else {
            console.log('❌ Kitchen image file not found at path');
        }

        // Save updated JSON
        fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(images, null, 2));
        console.log('✅ images.json updated successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadAndFix();
