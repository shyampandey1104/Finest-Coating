# Finest Coating - Premium Bath Resurfacing

This project consists of a premium frontend website and a Node.js backend for dynamic image management using Cloudinary.

## Project Structure

- `index.html`: The main frontend application.
- `server.js`: Node.js Express server for handling image uploads, deletions, and syncing with Cloudinary.
- `images.json`: Local database storing image URLs.
- `package.json`: Project dependencies and scripts.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shyampandey1104/Finest-Coating.git
   cd Finest-Coating
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Local Development

To start the backend server:
```bash
npm start
```
The server will run at `http://localhost:3000`.
You can access the website at `http://localhost:3000/index.html`.

### Deployment Tips

1. **Backend**: You can deploy the `server.js` to platforms like Heroku, Render, or Railway.
2. **Frontend**: The `index.html` can be served by the backend or deployed to static hosting like GitHub Pages, Vercel, or Netlify.
   - If deployed separately, ensure the `API_BASE_URL` in `index.html` points to your deployed backend URL.

## Features

- **Dynamic Image Gallery**: Images are fetched from Cloudinary.
- **Admin Controls**: Upload and delete images directly from the UI (available when running locally).
- **Service Detail Pages**: Interactive overlays for different resurfacing services.
- **Responsive Design**: Fully optimized for mobile and desktop.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Spline 3D, Lottie.
- **Backend**: Node.js, Express, Multer.
- **Storage**: Cloudinary (Images), Local JSON (Metadata).
