# Xobha Events (EMS) 🌸

An enterprise-grade, modern, and minimal **Event Management System (EMS)** designed specifically for the unique cultural and corporate landscape of **Assam and Northeast India**. 

*Xobha* (pronounced *Xoba* / *Soba*) is the Assamese word for gathering, assembly, or meeting, representing community and professional event coordination.

## Core Features 🚀
- **Role-Based Access Control (RBAC)**: Custom views and permissions for **Attendees**, **Organizers**, and **Administrators**.
- **Modern Interactive Dashboard**: Elegant analytics, event listing controls, and reservation check-ins.
- **Northeast India Customization**: Built-in selections for regional districts, local venue categories (Bihu fields, wedding halls, community centers), and cultural event categories (Bihu Utsavs, corporate gatherings, regional festivals).
- **Responsive minimalist design**: Dark/Light mode theme system built using `next-themes` and Tailind CSS.
- **Robust Real-time Backend**: Integrates Firebase Authentication, Firestore Database, and Firebase Storage.

## Tech Stack 🛠️
- **Frontend Framework**: Next.js 16 (App Router)
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui & Radix UI primitives
- **Backend & Database**: Firebase (Auth, Firestore, Cloud Storage)
- **State & Routing**: React Context, React 19 Server Hooks

## Project Setup & Installation ⚙️

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Firebase account

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/pallab-js/ems.git
   cd ems
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root folder and add your Firebase configurations:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```

## Folder Structure 📂
- `src/app/` - Next.js App routing, pages, and layouts.
- `src/components/` - Shared UI elements (layout components, forms, and shadcn-ui components).
- `src/lib/` - Utility configurations including `firebase.ts` and styling helpers.
- `src/context/` - Auth and global app contexts.
- `src/hooks/` - Reusable custom hooks.

## License 📄
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
