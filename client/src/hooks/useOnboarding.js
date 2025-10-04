import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../styles/onboarding.css';

export const startTour = () => {
  const intro = introJs();
  
  intro.setOptions({
    steps: [
      {
        title: 'Welcome to Entertainment.FM CRM!',
        intro: 'Let us show you around the navigation panel.'
      },
      {
        element: '[data-tour="work-page"]',
        intro: 'Start here! The Work Page shows your prioritized activities and sequences.',
        position: 'right'
      },
      {
        element: '[data-tour="accounts"]',
        intro: 'Manage all your client accounts here.',
        position: 'right'
      },
      {
        element: '[data-tour="contacts"]',
        intro: 'View and manage your contacts.',
        position: 'right'
      },
      {
        element: '[data-tour="deals"]',
        intro: 'Track your deals and opportunities.',
        position: 'right'
      },
      {
        element: '[data-tour="activities"]',
        intro: 'All your activities, tasks, and follow-ups.',
        position: 'right'
      },
      {
        element: '[data-tour="sequences"]',
        intro: 'Create and manage automated activity sequences.',
        position: 'right'
      },
      {
        element: '[data-tour="reports"]',
        intro: 'View analytics and reports for your CRM data.',
        position: 'right'
      },
      {
        element: '[data-tour="collapse-toggle"]',
        intro: 'Click here to collapse or expand the sidebar for more workspace.',
        position: 'right'
      }
    ],
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: true,
    doneLabel: 'Got it!',
    nextLabel: 'Next →',
    prevLabel: '← Back',
  });

  intro.start();
};