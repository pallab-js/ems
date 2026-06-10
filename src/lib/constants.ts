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
