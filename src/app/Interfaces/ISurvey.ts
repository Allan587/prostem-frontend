export interface ISurvey {
  id: string;
  name: string;
  body: { title: string, questions: string[] }
}