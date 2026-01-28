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

async function clearAll() {
    console.log('🚀 Starting cleanup process...');

    try {
        // 1. Delete all images from Cloudinary folders used in this app
        // We'll search for everything in the "Finest Coating" folder and subfolders
        let nextCursor = null;
        let totalDeleted = 0;

        do {
            const result = await cloudinary.search
                .expression('folder:"Finest Coating/*"')
                .max_results(100)
                .next_cursor(nextCursor)
                .execute();

            if (result.resources && result.resources.length > 0) {
                const publicIds = result.resources.map(r => r.public_id);

                // Delete these resources
                const deleteResult = await cloudinary.api.delete_resources(publicIds);
                const deletedCount = Object.keys(deleteResult.deleted).length;
                totalDeleted += deletedCount;

                console.log(`🗑️  Deleted ${deletedCount} images from Cloudinary...`);
                nextCursor = result.next_cursor;
            } else {
                nextCursor = null;
            }
        } while (nextCursor);

        console.log(`✅ Total deleted from Cloudinary: ${totalDeleted}`);

        // 2. Reset images.json
        const emptyData = {
            buffing: [],
            healthcare: [],
            industrial: [],
            bathtubs: [],
            urinals: [],
            kitchen: [],
            leftBefore: [],
            leftAfter: [],
            rightBefore: [],
            rightAfter: [],
            beforeAfterGallery: [],
            process: [],
            hero: [],
            services: [],
            industries: [],
            warranty: [],
            faq: [],
            decorative: [],
            bathroom: []
        };

        fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(emptyData, null, 2));
        console.log('✅ images.json has been reset to empty.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

clearAll();
