# 🚕 GoCab — Cab Booking Web Application

GoCab is a responsive cab-booking web application that connects riders and drivers through a simple booking experience. Built with Next.js, TypeScript, and Supabase, it supports user authentication, map-based route visualization, distance-based fare estimation, ride management, and driver operations.

🌐 **Live Demo:** [Add your Vercel deployment URL here]

📂 **GitHub Repository:** [Add your GitHub repository URL here]

## ✨ Features

- **User Authentication:** Sign up and log in using Supabase authentication.
- **Rider Dashboard:** Select pickup and drop-off locations and book rides.
- **Driver Dashboard:** Manage driver availability and handle ride requests.
- **Interactive Maps:** View locations and routes using OpenStreetMap.
- **Route and Distance Calculation:** Calculate routes using OpenRouteService.
- **Fare Estimation:** Estimate ride fares based on route distance and cab pricing.
- **Ride Management:** View ride history, track ride status, and cancel eligible rides.
- **Ride Receipts:** View and print ride receipts or save them as PDF.
- **Payment Method Selection:** Choose available demo payment methods.
- **Responsive UI:** Use the application across desktop and mobile screen sizes.
- **Database Security:** Use Supabase Row Level Security (RLS) policies to restrict access to authorized records.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application routing |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling and responsive layouts |
| Supabase | Authentication, PostgreSQL database, and access policies |
| OpenStreetMap | Map data |
| Leaflet | Interactive map rendering |
| OpenRouteService | Route and distance calculations |
| Vercel | Deployment and hosting |
| Git & GitHub | Version control and source code management |

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project
- An OpenRouteService API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/gocab-cab-booking-app.git
cd gocab-cab-booking-app
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
```

Replace the placeholder values with your own credentials. Never commit `.env.local` or expose private API keys in public repositories.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
```

## 🚀 Deployment

GoCab is deployed using Vercel.

To deploy your own instance:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables in Vercel.
4. Deploy the application.
5. Configure the production URL and authentication redirect settings in Supabase.

## 💳 Payment Status

Payment methods are currently implemented in demo mode. This project does not yet process real payments through a payment gateway. A production payment integration would require a provider such as Razorpay or Stripe, server-side payment verification, and appropriate security controls.

## 🔐 Security Notes

- Keep API credentials out of source control.
- Use Supabase Row Level Security to protect rider and driver records.
- Validate sensitive operations on the server.
- Do not treat a client-side payment selection as proof of payment.

## 🎯 Project Goals

GoCab was developed to explore full-stack web development, authentication, database integration, API usage, mapping, route-based fare estimation, role-based application workflows, and deployment.

## 👩‍💻 Author

**Sheetal Anand**

B.Tech Computer Science Engineering | GGSIPU

- GitHub: [Your GitHub Profile](https://github.com/YOUR-USERNAME)
- Portfolio: [Your Portfolio URL](YOUR-PORTFOLIO-URL)

---

*GoCab — making cab booking simpler through technology.*
