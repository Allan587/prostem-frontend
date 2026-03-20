import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { SurveyListComponent } from "../surveys/survey-list/survey-list.component";
import { UserListComponent } from "../users/user-list/user-list.component";
import { UserService } from '../users/data-access/user.service';
import EventListComponent from '../events/event-list/event-list.component';

@Component({
  selector: 'app-settings',
  imports: [MatTabsModule, SurveyListComponent, UserListComponent, EventListComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export default class SettingsComponent {

}
