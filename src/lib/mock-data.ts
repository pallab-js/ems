export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  category: string;
  image: string;
  organizerId: string;
  organizerName: string;
  capacity: number;
  availableTickets: number;
  price: number;
  status: "published" | "draft" | "cancelled";
  createdAt: string;
}

export const ASSAM_DISTRICTS = [
  "Kamrup Metropolitan (Guwahati)",
  "Dibrugarh",
  "Jorhat",
  "Sivasagar",
  "Sonitpur (Tezpur)",
  "Cachar (Silchar)",
  "Nagaon",
  "Tinsukia",
  "Bongaigaon",
  "Karbi Anglong (Diphu)"
];

export const NORTHEAST_STATES = [
  "Meghalaya (Shillong)",
  "Nagaland (Kohima)",
  "Mizoram (Aizawl)",
  "Manipur (Imphal)",
  "Arunachal Pradesh (Itanagar)",
  "Tripura (Agartala)",
  "Sikkim (Gangtok)"
];

export const ALL_LOCATIONS = [...ASSAM_DISTRICTS, ...NORTHEAST_STATES];

export const CATEGORIES = [
  "Bihu Utsav & Cultural",
  "Wedding & Reception",
  "Corporate Summit & Tech",
  "Exhibition & Mela",
  "Music Concert & Festival",
  "Sports & Adventure"
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "mock-1",
    title: "Jorhat Rongali Bihu Sanmilan",
    description: "Experience the vibrant spirit of Bohag Bihu with traditional Husori performances, Mukoli Bihu, and regional food stalls showcasing Assamese delicacies like Pitha and Laroo.",
    date: "2026-04-14T17:00:00.000Z",
    location: "Jorhat District Playground, Jorhat",
    district: "Jorhat",
    category: "Bihu Utsav & Cultural",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-1",
    organizerName: "Jorhat Cultural Committee",
    capacity: 5000,
    availableTickets: 4200,
    price: 0,
    status: "published",
    createdAt: "2026-03-01T10:00:00.000Z"
  },
  {
    id: "mock-2",
    title: "Northeast Tech & Startup Summit",
    description: "Connecting startups, investors, and tech leaders from Assam, Meghalaya, and the rest of the Northeast. Sessions on AI, eco-innovations, and local entrepreneurship development.",
    date: "2026-07-20T09:00:00.000Z",
    location: "Maniram Dewan Trade Centre, Guwahati",
    district: "Kamrup Metropolitan (Guwahati)",
    category: "Corporate Summit & Tech",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-2",
    organizerName: "NE Entrepreneurship Alliance",
    capacity: 800,
    availableTickets: 320,
    price: 499,
    status: "published",
    createdAt: "2026-03-10T08:00:00.000Z"
  },
  {
    id: "mock-3",
    title: "Shillong Cherry Blossom Festival 2026",
    description: "Celebrate the autumn pink blooms in Meghalaya with live music headliners, fashion shows, wine tasting, and local food stalls in the scenic Ward's Lake and Polo Grounds.",
    date: "2026-11-15T10:00:00.000Z",
    location: "Polo Grounds, Shillong",
    district: "Meghalaya (Shillong)",
    category: "Music Concert & Festival",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-3",
    organizerName: "Meghalaya Tourism Board",
    capacity: 15000,
    availableTickets: 9400,
    price: 800,
    status: "published",
    createdAt: "2026-03-12T12:00:00.000Z"
  },
  {
    id: "mock-4",
    title: "Royal Ahom Heritage Exhibition",
    description: "A week-long historical exhibition displaying weapons, clothing, manuscripts, and architectural scale models of the glorious Ahom Dynasty of Sivasagar.",
    date: "2026-08-05T10:00:00.000Z",
    location: "Tai Ahom Cultural Center, Sivasagar",
    district: "Sivasagar",
    category: "Exhibition & Mela",
    image: "https://images.unsplash.com/photo-1531266752426-aad472b7bbf4?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-1",
    organizerName: "Sivasagar Historical Council",
    capacity: 1200,
    availableTickets: 1200,
    price: 50,
    status: "published",
    createdAt: "2026-03-15T11:00:00.000Z"
  },
  {
    id: "mock-5",
    title: "Kaziranga Eco-Tourism & Wildlife Expo",
    description: "An interactive exposition raising awareness about wildlife conservation, community forest management, and introducing green hospitality services for Assam travel agents.",
    date: "2026-10-01T09:00:00.000Z",
    location: "Kaziranga Convention Hall, Kohora",
    district: "Sonitpur (Tezpur)",
    category: "Corporate Summit & Tech",
    image: "https://images.unsplash.com/photo-1581859814481-03b517b77af4?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-4",
    organizerName: "Assam Forest Dept Collaborators",
    capacity: 400,
    availableTickets: 120,
    price: 0,
    status: "published",
    createdAt: "2026-03-18T14:00:00.000Z"
  },
  {
    id: "mock-6",
    title: "Majuli Satriya Dance & Theater Festival",
    description: "Experience the spiritual and classical Satriya dance forms, Bhaona theater, and traditional mask making workshops at the historic Satras of Majuli river island.",
    date: "2026-12-10T14:00:00.000Z",
    location: "Garmur Satra Premises, Majuli",
    district: "Jorhat",
    category: "Bihu Utsav & Cultural",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
    organizerId: "organizer-1",
    organizerName: "Majuli Satra Samiti",
    capacity: 1000,
    availableTickets: 650,
    price: 150,
    status: "published",
    createdAt: "2026-03-20T09:00:00.000Z"
  }
];
