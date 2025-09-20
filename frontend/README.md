# Aegis - Safe Navigation App

**Aegis** is a cutting-edge navigation application that prioritizes user safety by integrating real-time crime data and lighting information to provide adaptive route guidance. Built for the PennApps hackathon, this app aims to revolutionize how people navigate urban environments safely.

## 🌟 Features

- **Professional Google Maps Interface**: Clean, modern UI with custom styling
- **Real-time Location Detection**: Automatically detects and displays user's current location
- **Smart Route Planning**: Input start and end destinations with Google Places autocomplete
- **Interactive Map Controls**: Custom zoom controls and location centering
- **Live Safety Data Integration**: Ready for crime and lighting data integration
- **Mobile-Responsive Design**: Optimized for all device sizes
- **Professional UI/UX**: Designed to win hackathons with outstanding visual appeal

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Maps API Key with the following APIs enabled:
  - Maps JavaScript API
  - Places API
  - Geolocation API

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pennapps-2025/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

   **How to get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Maps JavaScript API and Places API
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the app in action!

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── Navigate.tsx      # Main map interface
│   ├── App.tsx              # Landing page
│   ├── main.tsx             # App entry point with routing
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables
└── package.json            # Dependencies
```

## 🎨 Key Components

### Navigate.tsx
The main map interface featuring:
- **Google Maps Integration**: Full-screen interactive map
- **Location Services**: Automatic current location detection
- **Search Panel**: Slide-out overlay for route planning
- **Autocomplete**: Google Places API integration for location suggestions
- **Custom Controls**: Zoom in/out and location centering
- **Status Bar**: Live updates on location and zoom level

### App.tsx
Professional landing page with:
- **Hero Section**: Compelling introduction to Aegis
- **Feature Showcase**: Highlighting key capabilities
- **Call-to-Action**: Direct navigation to the map interface

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Package Manager**: npm

## 🎯 Future Enhancements

The app is architected to easily integrate:

1. **Crime Data Integration**
   - Real-time crime API integration
   - 911 call data processing
   - Risk assessment algorithms

2. **Lighting Data**
   - NASA VIIRS satellite data integration
   - Street lighting analysis
   - Visibility safety scoring

3. **Advanced Routing**
   - Multi-factor route optimization
   - Real-time route adjustments
   - Emergency alert system

4. **Additional Features**
   - User-reported incidents
   - Community safety features
   - Historical crime pattern analysis

## 📱 Mobile Optimization

The app is fully responsive and optimized for:
- **Touch Interactions**: Gesture-friendly map controls
- **Mobile Layout**: Adaptive UI components
- **Performance**: Optimized for mobile networks
- **Accessibility**: Screen reader compatible

## 🏆 Hackathon Ready

This project is specifically designed for hackathon success:
- **Professional Design**: Modern, clean interface
- **Scalable Architecture**: Easy to extend with new features
- **Demo-Ready**: Fully functional core features
- **Documentation**: Comprehensive setup and usage guides

## 🚀 Deployment

The app is configured for easy deployment to platforms like:
- Vercel (recommended)
- Netlify
- Firebase Hosting

Simply connect your repository and deploy with automatic builds.

## 📄 License

This project is built for the PennApps hackathon and is open for educational and demonstration purposes.

---

**Built with ❤️ for PennApps 2025**

*Aegis - Navigate Safely, Arrive Confidently*
