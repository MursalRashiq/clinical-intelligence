import type { Doctor, Specialty } from "./index";

export const specialties: Specialty[] = [
  { icon: "❤️", name: "Cardiology",  count: 24 },
  { icon: "🧠", name: "Neurology",   count: 18 },
  { icon: "🦷", name: "Dentist",     count: 31 },
  { icon: "🧒", name: "Pediatrics",  count: 22 },
  { icon: "🧬", name: "Urology",     count: 14 },
];

export const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Darren Elder",
    specialty: "Dentist",
    location: "New York, USA",
    fee: "₹200",
    rating: 4.9,
    available: true,
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&fit=crop&crop=faces,top",
  },
  {
    id: 2,
    name: "Dr. Ruby Perrin",
    specialty: "Periodontology",
    location: "New York, USA",
    fee: "₹300",
    rating: 4.8,
    available: true,
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&fit=crop&crop=faces,top",
    specColor: { bg: "#ecfdf5", text: "#065f46" },
  },
  {
    id: 3,
    name: "Dr. Deborah Angel",
    specialty: "Cardiologist",
    location: "Atlanta, USA",
    fee: "₹400",
    rating: 4.7,
    available: true,
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&fit=crop&crop=faces,top",
    specColor: { bg: "#fff3ee", text: "#c2410c" },
  },
];

export const timeSlots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] as const;
export const visitTypes = ["📹 Video Call", "💬 Chat", "🏥 In-Person"] as const;
