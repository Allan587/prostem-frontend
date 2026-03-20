import { Component, Input } from '@angular/core';
import { ICard } from '../../Interfaces/ICard';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  imports: [RouterModule, CommonModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!: ICard;
}
