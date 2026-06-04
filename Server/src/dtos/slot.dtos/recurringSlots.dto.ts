export interface RecurringSlotsDTO {
  startTime: string;
  endTime: string;
  days: string[];
  skipOverlappingDays?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface RecurringSlotsResponseDTO {
  success: boolean;
  overlappingDays: string[];
  nonOverlappingDays: string[];
  message?: string;
}
