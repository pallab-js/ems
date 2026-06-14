# Xobha Events (EMS) 🌸

An enterprise-grade, modern, and minimal **Event Management System (EMS)** designed specifically for the unique cultural and corporate landscape of **Assam and Northeast India**. 

*Xobha* (pronounced *Xoba* / *Soba*) is the Assamese word for gathering, assembly, or meeting, representing community and professional event coordination. The platform combines a warm editorial design system with robust, role-based workflows to streamline regional event hosting and seat reservations.

---

## Key Features 🚀

*   **Role-Based Access Control (RBAC):** Tailored, separate portals for **Attendees** (bookings, cancellations), **Organizers** (analytics, event publishing, guest list check-ins), and **Administrators** (user accounts and system roles supervision).
*   **Atomic Seat Reservations:** Leverages **Firestore Transactions** (`runTransaction`) to handle reservations and self-cancellations. This guarantees concurrency safety and prevents overbooking or double-booking.
*   **Organizer Dashboard & Guest Manager:** Real-time guest list management enabling organizers to toggle attendee check-in status ("Checked In" / "Pending") directly on the dashboard.
*   **Interactive Event Editor:** Secure modification portal for organizers to update event details (locations, dates, category) with seat-bounds protection (prevents reducing seat capacity below the number of tickets already registered).
*   **Map Navigation Routing:** Displays regional venues and districts paired with dynamic map directions routing queries (Google Maps) to assist local attendees.
*   **Warm Editorial Brand Aesthetics:** Implements the Anthropic-inspired pacing rhythm—warm cream canvas floor, primary coral CTAs, dark navy command-panel surfaces, and typography layouts using serif displays paired with humanist sans.

---

## Tech Stack 🛠️

*   **Frontend Framework:** Next.js 16 (App Router with Turbopack)
*   **Programming Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **UI Components:** shadcn/ui & `@base-ui/react` primitives
*   **Icons:** Lucide React
*   **Backend & Database:** Firebase (Authentication, Firestore Database, Cloud Storage)
*   **State Management:** React Context API & React 19 Client Hooks

---

## Folder Structure 📂

```text
├── public/                     # Static assets & icons
├── src/
│   ├── app/                    # Next.js App routing
│   │   ├── dashboard/          # Role-based workspace portals
│   │   │   ├── admin/          # User directories and role settings
│   │   │   ├── attendee/       # Booked tickets history and cancellations
│   │   │   └── organizer/      # Listings management, check-in manager, editor
│   │   ├── events/             # Browsing, filters, and checkout transactions
│   │   ├── login/              # Secure auth authentication
│   │   └── register/           # Display name metadata & profile setup
│   ├── components/             # Reusable UI cards, inputs, and layout headers
│   ├── context/                # Authentication profile and session listeners
│   └── lib/                    # Configuration constants and helper utilities
├── firestore.rules             # Database security policies
└── storage.rules               # Cloud Storage access rules
```

---

## Project Setup & Installation ⚙️

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   Firebase project configured with Email/Password auth and Firestore

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/pallab-js/ems.git
    cd ems
    ```

2.  **Install Project Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Launch the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

5.  **Build and Linting checks:**
    Verify production build and ESLint rules compilation:
    ```bash
    npm run lint
    ```
    ```bash
    npm run build
    ```

---

## Database Security Rules 🔒

Firestore and Storage rules are configured under version control.
*   **Firestore Rules (`firestore.rules`):** Ensures attendees can only update seat capacities and cancel their own tickets; prevents non-owners from editing events; secures profile roles.
*   **Cloud Storage Rules (`storage.rules`):** Restricts image uploads to authenticated accounts; allows public reads for event banner displays.

To deploy Firebase rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```

---

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
