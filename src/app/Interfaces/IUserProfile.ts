import { IAppUser } from "./IAppUser";

export interface IUserProfile extends IAppUser {
  id: string;
  name: string;
  lastName1: string;
  lastName2: string;
  birthDate: string;
  institution: string;
  phone: string;
  teachingLevel: string,
  specializations: string[];
  photoURL?: string;
}