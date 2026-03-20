export interface ICard {

  id: string;

  title: string;

  body: string;

  icon: string;

  roles: string[];

  routerLink?: string; // Added optional routerLink property

}
