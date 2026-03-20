export interface IEvent {
  id: string,
  attendees: {},
  title: string,
  startDate: string,
  endDate: string,
  durationHours: number | null,
  startTime: string,
  endTime: string,
  place: string,
  description: string,
  enrollmentType: string;
  capacity: number | null,
  virtualEvent: boolean,
  teachingLevels: string[],
  specialties: string[],
  registeredUsers: string[],
  pendingRequests: { uid: string; name: string; }[],
  waitingList: { uid: string; name: string; }[],
  evaluationType: string;
  eventCategory: string;
  survey: string | null,
  grades?: { uid: string; name: number; }[],
}
