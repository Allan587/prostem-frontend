import { TemplateRef } from '@angular/core';

export interface IModal {
  title: string;
  contentTemplate: TemplateRef<any>;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
}