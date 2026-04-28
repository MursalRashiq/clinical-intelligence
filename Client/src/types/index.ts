export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  fee: string;
  rating: number;
  available: boolean;
  photo: string;
  specColor?: { bg: string; text: string };
}

export interface Specialty {
  icon: string;
  name: string;
  count: number;
}

export interface BookingForm {
  firstName: string;
  lastName: string;
  date: string;
  timeSlot: string;
  visitType: string;
}

export interface NavLink {
  label: string;
  href: string;
}
