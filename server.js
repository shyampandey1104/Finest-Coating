const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dd2sbrcrr',
    api_key: '173777767114771',
    api_secret: 'vcbZWirynnzsfWAlOgg-Jg6Xyqg'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Path to images.json
const IMAGES_JSON_PATH = path.join(__dirname, 'images.json');

// Cloudinary folder mapping
const CLOUDINARY_FOLDERS = {
    buffing: 'Finest Coating/Buffing',
    healthcare: 'Finest Coating/Healthcare',
    industrial: 'Finest Coating/Industrial',
    bathtubs: 'Finest Coating/Bathtubs',
    urinals: 'Finest Coating/Urinals',
    kitchen: 'Finest Coating/Kitchen',
    beforeAfterGallery: 'Finest Coating/Before After Transformations',
    beforeafter: 'Finest Coating/Before After Transformations',
    before: 'Finest Coating/Transformations/Before',
    after: 'Finest Coating/Transformations/After',
    more: 'Finest Coating/More Images/General',
    config: 'Finest Coating/Site Config',
    leftBefore: 'Finest Coating/More Images/Left Before',
    leftAfter: 'Finest Coating/More Images/Left After',
    rightBefore: 'Finest Coating/More Images/Right Before',
    rightAfter: 'Finest Coating/More Images/Right After',
    abdulBuffing: 'Abdul Images/Finest Coating/decorative',
    abdulHealthcare: 'Abdul Images/Finest Coating/healthcare',
    abdulIndustrial: 'Abdul Images/Finest Coating/industrial',
    abdulBathtubs: 'Abdul Images/Finest Coating/bathroom',
    abdulUrinals: 'Abdul Images/Finest Coating/urinals',
    abdulKitchen: 'Abdul Images/Finest Coating/kitchen',
    abdulBeforeAfter: 'Abdul Images/Finest Coating/Before After'
};

// Helper: Read images.json
function readImagesJson() {
    try {
        const data = fs.readFileSync(IMAGES_JSON_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
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
            beforeAfterGallery: []
        };
    }
}

// Helper: Write images.json
function writeImagesJson(data) {
    fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(data, null, 2));
}

// API: Get all images
app.get('/api/images', (req, res) => {
    const images = readImagesJson();
    res.json(images);
});

// API: Get images by category
app.get('/api/images/:category', (req, res) => {
    const { category } = req.params;
    const images = readImagesJson();
    res.json(images[category] || []);
});

// API: Upload image
app.post('/api/upload/:category', upload.single('image'), async (req, res) => {
    try {
        const { category } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!CLOUDINARY_FOLDERS[category]) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: CLOUDINARY_FOLDERS[category],
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Update images.json
        const images = readImagesJson();

        // Handle special 'config' key as an object if we want, 
        // but for simplicity let's just use the 'site_config' category
        if (category === 'config') {
            if (!images.site_config) images.site_config = {};
            // If the user provided a specific key in query params
            const configKey = req.query.key;
            if (configKey) {
                images.site_config[configKey] = result.secure_url;
            } else {
                if (!images.config) images.config = [];
                images.config.push(result.secure_url);
            }
        } else {
            if (!images[category]) {
                images[category] = [];
            }
            images[category].push(result.secure_url);
        }

        writeImagesJson(images);

        console.log(`✅ Image uploaded to ${category}: ${result.secure_url}`);

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            category: category
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Delete image
app.delete('/api/delete', async (req, res) => {
    try {
        const { url, category } = req.body;

        if (!url || !category) {
            return res.status(400).json({ error: 'URL and category required' });
        }

        // Extract public_id from URL
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
        if (!match) {
            return res.status(400).json({ error: 'Invalid Cloudinary URL' });
        }
        const publicId = decodeURIComponent(match[1]);

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        // Remove from images.json
        const images = readImagesJson();
        if (images[category]) {
            images[category] = images[category].filter(imgUrl => imgUrl !== url);
            writeImagesJson(images);
        }

        console.log(`🗑️ Image deleted from ${category}: ${url}`);

        res.json({
            success: true,
            result: result,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Sync images from Cloudinary (fetch all and update images.json)
app.post('/api/sync', async (req, res) => {
    try {
        console.log('🔄 Syncing images from Cloudinary using resources API...');

        const images = readImagesJson();

        for (const [category, folder] of Object.entries(CLOUDINARY_FOLDERS)) {
            try {
                const result = await cloudinary.api.resources({
                    type: 'upload',
                    prefix: folder,
                    max_results: 500
                });

                if (result.resources && result.resources.length > 0) {
                    // Filter to only include exactly what's in that folder if prefix matches too much
                    // (Though usually prefix is fine)
                    images[category] = result.resources.map(r => r.secure_url);
                    console.log(`  ✅ ${category}: ${result.resources.length} images`);
                } else {
                    console.log(`  ℹ️ ${category}: 0 images found in ${folder}`);
                }
            } catch (error) {
                console.log(`  ⚠️ ${category}: Error fetching from ${folder} - ${error.message}`);
            }
        }

        writeImagesJson(images);

        res.json({
            success: true,
            message: 'Images synced from Cloudinary',
            images: images
        });

    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Finest Coating Server Running!                        ║
║                                                            ║
║   Local:    http://localhost:${PORT}                         ║
║   Website:  http://localhost:${PORT}/index.html              ║
║                                                            ║
║   API Endpoints:                                           ║
║   • GET  /api/images          - Get all images             ║
║   • GET  /api/images/:category - Get category images       ║
║   • POST /api/upload/:category - Upload image              ║
║   • DELETE /api/delete        - Delete image               ║
║   • POST /api/sync            - Sync from Cloudinary       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
