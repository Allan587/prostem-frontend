import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-modal',
  imports: [PortalModule, CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit {
  @ViewChild(CdkPortal) portal: CdkPortal | undefined;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<void>();
  @Input() showSubmitBtn = false;
  @Input() submitBtnText = 'Confirmar';
  @Input() isSubmittingChanges = false;

  overlay = inject(Overlay);
  overlayConfig = new OverlayConfig({
    hasBackdrop: true,
    positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    scrollStrategy: this.overlay.scrollStrategies.block(),
    minWidth: 500
  });
  overlayReference = this.overlay.create(this.overlayConfig);

  closeButtonTooltipText = 'Cerrar';
  tooltipDuration = 25;   // In milliseconds


  onSubmit(): void {
    //this.elementReference.nativeElement.remove();
    this.submitModal.emit();
  }

  ngOnInit(): void {
    // Close the modal when clicking outside of it.
    this.overlayReference.backdropClick().subscribe(() => {
      this.closeModal.emit();
    });
  }

  ngAfterViewInit(): void {
    this.overlayReference.attach(this.portal);
  }

  ngOnDestroy(): void {
    this.overlayReference?.detach()
    this.overlayReference?.dispose();
  }
}
