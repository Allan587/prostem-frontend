export interface IAppUser {
  uid: string;
  email: string;
  name: string;
  role: string;
  myEvents: {
    [eventId: string]: { grade?: number, type: 'Participación' | 'Aprovechamiento' }
  };
  teachingLevel: string;
  specializations: string[]
}