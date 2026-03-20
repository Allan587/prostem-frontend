import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Survey from 'survey-angular';
import 'survey-angular/survey.css';
import { SurveyService } from '../data-access/survey.service';
import { SurveyModule } from 'survey-angular-ui';
import "survey-core/i18n/spanish";
import { AuthStateService } from '../../../shared/auth-state.service';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-survey',
  imports: [SurveyModule],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.css'
})
export default class SurveyComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private surveyService: SurveyService,
    private authStateService: AuthStateService) { }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.paramMap.get('surveyID');
    if (surveyId) {
      this.loadSurvey(surveyId);
    }
  }

  async loadSurvey(id: string) {
    try {
      const surveyData = await this.surveyService.getSurveyByID(id);
      const survey = new Survey.Model(surveyData);
      //Translate survey UI to Spanish
      survey.locale = 'es'

      survey.onComplete.add(async (sender) => {
        const responseData = sender.data;
        const user = await firstValueFrom(this.authStateService.currentUser$);
        const uid = user?.uid;

        if (!uid) {
          toast.error('No se pudo obtener tu usuario');
          return;
        }

        try {
          await this.surveyService.saveSurveyResponse(id, {
            uid,
            answers: responseData,
          });
          toast.success('¡Tu respuesta se guardó exitosamente!')
          console.log('Respuesta guardada con éxito');
        } catch (err) {
          toast.error('Error al guardar respuesta.')
          console.error('Error al guardar respuesta:', err);
        }
      });

      Survey.SurveyNG.render('surveyContainer', { model: survey });
    } catch (error) {
      toast.error('Error al cargar la encuesta.')
      console.error('Error al cargar la encuesta:', error);
    }
  }

}
