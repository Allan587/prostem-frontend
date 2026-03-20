export interface IUserSignUp {
  email: string,
  password: string,
  userName: string,
  lastName1: string,
  lastName2: string,
  phone: string,
  birthDate: string,
  institution: string,
  interests: Array<string | null>,
  photo: File | null
}