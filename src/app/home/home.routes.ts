import { Routes } from "@angular/router";
import { privateGuard } from "../core/guards/auth.guard";
import { hasRoleGuard } from "../core/guards/has-role.guard";

export default [
  {
    path: '',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./homeComponent/home.component')
  },
  {
    path: 'eventos',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./events/event-list/event-list.component'),
    title: 'Eventos'
  },
  {
    path: 'nuevo-evento',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./events/event-form/event-form.component'),
    title: 'Crear nuevo evento'
  },
  {
    path: 'editar/:eventID',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./events/event-form/event-form.component'),
    title: 'Editar evento'
  },
  {
    path: 'asignar-notas/:eventID',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./events/assign-grades/assign-grades.component'),
    title: 'Asignar notas'
  },
  {
    path: 'calendario',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./calendar/calendar.component'),
    title: 'Mi calendario'
  },
  {
    path: 'mis-cursos',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./my-events/my-events.component'),
    title: 'Mis cursos'
  },
  {
    path: 'mi-cuenta',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./user-account-settings/user-account-settings.component'),
    title: 'Mi cuenta'
  },
  {
    path: 'contactanos',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./contact-us/contact-us.component'),
    title: 'Contáctanos'
  },
  {
    path: 'estadisticas',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./statistics/general-statistics/general-statistics.component'),
    title: 'Estadísticas'
  },
  {
    path: 'configuracion',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./settings/settings.component'),
    title: 'Configuración'
  },
  {
    path: 'eventos-academicos',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./events/academic-events/academic-events.component').then(m => m.AcademicEventsComponent),
    title: 'Eventos académicos'
  },
  {
    path: 'eventos-academicos/conferencias',
    loadComponent: () => import('./events/conferences/conference-panel/conference-panel.component').then(m => m.ConferencePanelComponent),
    title: 'Conferencias'
  },
  {
    path: 'crear-encuesta',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./surveys/survey-builder/survey-builder.component'),
    title: 'Crear una encuesta'
  },
  {
    path: 'encuesta/:surveyID',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./surveys/survey/survey.component'),
    title: 'Responder encuesta'
  },
  {
    path: 'eventos-academicos/conferencias/nueva',
    loadComponent: () => import('./events/conferences/new-conference/new-conference.component').then(m => m.NewConferenceComponent),
    title: 'Nueva Conferencia'
  },
  {
    path: 'eventos-academicos/conferencias/editar/:id',
    loadComponent: () =>
      import('./events/conferences/conferences-list/edit-conference/edit-conference.component').then((m) => m.EditConferenceComponent),
    title: 'Editar Conferencia'
  },
  {
    path: 'eventos-academicos/conferencias/administrador',
    loadComponent: () => import('./events/conferences/conferences-list/manager-conferences/manager-conferences.component').then(m => m.ManagerConferencesComponent),
    title: 'Conferencias Administrador'
  },
  {
    path: 'eventos-academicos/conferencias/ponencias/administrador/:conferenceId',
    loadComponent: () => import('./events/conferences/presentations/manager-presentations-list/manager-presentations-list.component').then(m => m.ManagerPresentationsListComponent),
    title: 'Ponencias Administrador'
  },
  {
    path: 'eventos-academicos/conferencias/conferencias-ponente',
    loadComponent: () => import('./events/conferences/conferences-list/conferences-speaker/conferences-speaker.component').then(m => m.ConferencesSpeakerComponent),
    title: 'Ponencias Administrador'
  },
  {
    path: 'eventos-academicos/conferencias/revisores',
    loadComponent: () => import('./events/conferences/reviewers/reviewers-panel/reviewers-panel.component').then(m => m.ReviewersPanelComponent),
    title: 'Lista de revisores'
  },
  {
    path: 'eventos-academicos/conferencias/revisores/nuevo-revisor',
    loadComponent: () => import('./events/conferences/reviewers/new-reviewer/new-reviewer.component').then(m => m.NewReviewerComponent),
    title: 'Nuevo revisor'
  },
  {
    path: 'eventos-academicos/conferencias/conferences-presentations-creator-list',
    loadComponent: () => import('./events/conferences/conferences-presentations-creator/conferences-presentations-creator-list/conferences-presentations-creator-list.component').then(m => m.ConferencesPresentationsCreatorListComponent),
    title: 'Conferencias, ponencias'
  },
 
  {
    path: 'eventos-academicos/conferencias/:conferenceId/nueva-ponencia',
    loadComponent: () => import('./events/conferences/conferences-presentations-creator/new-presentation/new-presentation.component').then(m => m.NewPresentationComponent),
    title: 'Nueva Ponencia'
  },
  {
    path: 'eventos-academicos/conferencias/asignar-revisor/:presentationId',
    loadComponent: () => import('./events/conferences/reviewers/assign-reviewer/assign-reviewer.component').then(m => m.AssignReviewerComponent),
    title: 'Asignar revisor'
  },
  {
    path: 'eventos-academicos/conferencias/ponente/:conferenceId',
    loadComponent: () => import('./events/conferences/presentations/presentations-speaker/presentations-speaker.component').then(m => m.PresentationsSpeakerComponent),
    title: 'Ponencias del Ponente'
  },
  {
    path: 'eventos-academicos/conferencias/formularios-revision/formularios-disponibles/:conferenceId',
    loadComponent: () => import('./events/conferences/revision-form/revision-forms-list/revision-forms-list.component').then(m => m.RevisionFormsListComponent),
    title: 'Ponencias del Ponente'
  },
  {
    path: 'eventos-academicos/conferencias/formularios-revision/nuevo/:conferenceId',
    loadComponent: () => import('./events/conferences/revision-form/new-revision-form/new-revision-form.component').then(m => m.NewRevisionFormComponent),
    title: 'Nuevo Formulario de Revisión'
  },
  {
    path: 'ver-respuestas/:surveyID',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin']
    },
    loadComponent: () => import('./surveys/survey-responses/survey-responses.component'),
    title: 'Ver respuestas de encuesta'
  },
  {
    path: 'eventos-academicos/conferencias/formularios-revision/ver',
    loadComponent: () =>
      import('./events/conferences/conferences-list/conferences-reviewer/conferences-reviewer.component').then(
        (m) => m.ConferencesReviewerComponent
      ),
    title: 'Ver conferencias donde tengo ponencias asignadas'
  },
  {
    path: 'eventos-academicos/conferencias/formularios-revision-revisor/ver/:formId',
    loadComponent: () =>
      import('./events/conferences/revision-form/view-revision-form/view-revision-form.component').then(
        (m) => m.ViewRevisionFormComponent
      ),
    title: 'Ver formulario de revisión'
  },
  {
    path: 'eventos-academicos/conferencias/conferencias-revisor/:conferenceId',
    loadComponent: () => import('./events/conferences/revision-form/revision-forms-list/revision-forms-list.component').then(m => m.RevisionFormsListComponent),
    title: 'Ponencias del Ponente'
  },
  {
    path: 'eventos-academicos/conferencias/revisor/ponencias/:conferenceId',
    loadComponent: () =>
      import('./events/conferences/presentations/presentations-reviewer/presentations-reviewer.component').then(
        (m) => m.PresentationsReviewerComponent
      ),
    title: 'Ponencias Asignadas para Revisión'
  },

  {
    path: 'eventos-academicos/conferencias/revisor/ponencias/revision/:presentationId',
    loadComponent: () =>
      import('./events/conferences/revision-form/fill-revision-form/fill-revision-form.component').then(
        (m) => m.FillRevisionFormComponent
      ),
    title: 'Formulario de Revisión'
  },

  {
    path: 'noticias',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./news/news-panel/news-panel.component').then(m => m.NewsPanelComponent),
    title: 'Noticias'
  },
  {
    path: 'noticias/crear',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./news/create-news/create-news.component').then(m => m.CreateNewsComponent),
    title: 'Crear Noticia'
  },
  {
    path: 'noticias/editar/:id',
    canActivate: [privateGuard, hasRoleGuard],
    data: {
      roles: ['admin', 'user']
    },
    loadComponent: () => import('./news/create-news/create-news.component').then(m => m.CreateNewsComponent),
    title: 'Editar Noticia'
  },
  
  
] as Routes;