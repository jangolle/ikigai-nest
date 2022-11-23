import { Template } from 'lib/@ikigai/mail';

export class WelcomeTemplate extends Template<{
  actionUrl: string;
}> {
  readonly name: string = 'welcome';
}
