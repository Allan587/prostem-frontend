import { CommonModule } from '@angular/common';
import { Component, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface BaseModalData {
  title: string;
  contentTemplate: TemplateRef<any>;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
}

@Component({
  selector: 'app-angularMaterialModal',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BaseModalData
  ) { }

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

}
