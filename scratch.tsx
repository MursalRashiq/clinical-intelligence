import { useState } from "react";

// Types
type SlotStatus = "Booked" | "Available";

interface Slot {
  id: number;
  time: string;
  status: SlotStatus;
}

interface DayTab {
  day: string;
  date: number;
  active?: boolean;
}

// Data
const dayTabs: DayTab[] = [
  { day: "Mon", date: 12 },
  { day: "Tue", date: 13 },
  { day: "Wed", date: 14, active: true },
  { day: "Thu", date: 15 },
  { day: "Fri", date: 16 },
  { day: "Sat", date: 17 },
  { day: "Sun", date: 18 },
];

const initialSlots: Slot[] = [
  { id: 1, time: "09:00 AM - 09:30 AM", status: "Booked" },
  { id: 2, time: "09:45 AM - 10:15 AM", status: "Available" },
  { id: 3, time: "11:00 AM - 11:30 AM", status: "Available" },
];

<truncated 17497 bytes>