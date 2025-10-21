import introJs from 'intro.js';
import 'intro.js/introjs.css';
import '../styles/onboarding.css';

export const startTour = (userRole) => {
  const intro = introJs.tour();
  
  const roleMapping = {
    'c-level': 'clevel',
    'sales manager': 'salesmanager',
    'sales representative': 'salesrep',
  };
  
  // Normalize the role to handle different formats
  const normalizedInput = userRole?.toLowerCase().trim();
  const normalizedRole = roleMapping[normalizedInput] || 'salesrep';

  // Base steps that everyone sees
  const baseSteps = [
    {
      title: 'Welcome to Entertainment.FM CRM!',
      intro: 'Let us show you around the navigation panel.'
    }
  ];

  // Role-specific steps
  const roleSpecificSteps = {
    clevel: [
      {
        element: '[data-tour="dashboard"]',
        intro: 'Your Dashboard - Get a quick overview of your key metrics and activities.',
        position: 'right'
      },
      {
        element: '[data-tour="reports"]',
        intro: 'Access detailed reports and analytics for business insights.',
        position: 'right'
      },
      {
        element: '[data-tour="work-page"]',
        intro: 'The Work Page shows your prioritized activities and sequences.',
        position: 'right'
      },
      {
        element: '[data-tour="audit-log"]',
        intro: 'Track all system changes and user activities in the Audit Log.',
        position: 'right'
      },
      {
        element: '[data-tour="teams"]',
        intro: 'Manage your teams and team members here.',
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
        element: '[data-tour="products"]',
        intro: 'Manage your products and services catalog.',
        position: 'right'
      },
      {
        element: '[data-tour="sequences"]',
        intro: 'Create and manage automated activity sequences.',
        position: 'right'
      }
    ],
    salesmanager: [
      {
        element: '[data-tour="dashboard"]',
        intro: 'Your Dashboard - Get a quick overview of your key metrics and activities.',
        position: 'right'
      },
      {
        element: '[data-tour="reports"]',
        intro: 'Access detailed reports to track team performance and sales metrics.',
        position: 'right'
      },
      {
        element: '[data-tour="work-page"]',
        intro: 'The Work Page shows your prioritized activities and sequences.',
        position: 'right'
      },
      {
        element: '[data-tour="audit-log"]',
        intro: 'Track team activities and system changes in the Audit Log.',
        position: 'right'
      },
      {
        element: '[data-tour="employees"]',
        intro: 'Manage your sales team members.',
        position: 'right'
      },
      {
        element: '[data-tour="accounts"]',
        intro: 'Manage all client accounts assigned to your team.',
        position: 'right'
      },
      {
        element: '[data-tour="contacts"]',
        intro: 'View and manage contacts across your team.',
        position: 'right'
      },
      {
        element: '[data-tour="deals"]',
        intro: 'Track deals and opportunities for your team.',
        position: 'right'
      },
      {
        element: '[data-tour="activities"]',
        intro: 'Monitor all activities and tasks across your team.',
        position: 'right'
      },
      {
        element: '[data-tour="products"]',
        intro: 'Manage your products and services catalog.',
        position: 'right'
      },
      {
        element: '[data-tour="sequences"]',
        intro: 'Create and manage automated activity sequences for your team.',
        position: 'right'
      }
    ],
    salesrep: [
      {
        element: '[data-tour="work-page"]',
        intro: 'Start here! The Work Page shows your prioritized activities and sequences - your daily command center.',
        position: 'right'
      },
      {
        element: '[data-tour="teams"]',
        intro: 'Start here! The Work Page shows your prioritized activities and sequences - your daily command center.',
        position: 'right'
      },
      {
        element: '[data-tour="accounts"]',
        intro: 'Manage your assigned client accounts here.',
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
        element: '[data-tour="products"]',
        intro: 'Browse the products and services catalog.',
        position: 'right'
      },
      {
        element: '[data-tour="sequences"]',
        intro: 'View and follow automated activity sequences.',
        position: 'right'
      }
    ]
  };

  // Common closing steps for everyone
  const closingSteps = [
    {
      element: '[data-tour="collapse-toggle"]',
      intro: 'Click here to collapse or expand the sidebar for more workspace.',
      position: 'right'
    },
    {
      title: 'You\'re all set!',
      intro: 'You can restart this guide anytime from your profile menu. Happy selling! 🎉'
    }
  ];

  // Combine steps based on role
  const selectedSteps = roleSpecificSteps[normalizedRole];
  
  if (!selectedSteps) {
    console.warn(`Unknown role: ${normalizedRole}, defaulting to salesrep`);
  }
  
  const allSteps = [
    ...baseSteps,
    ...(selectedSteps || roleSpecificSteps.salesrep),
    ...closingSteps
  ];

  intro.setOptions({
    steps: allSteps,
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: true,
    doneLabel: 'Got it!',
    nextLabel: 'Next →',
    prevLabel: '← Back',
    skipLabel: 'X' //skip guide
  });

  intro.start();
};

// Export a wrapper function that gets user role from context/props
export const startRoleBasedTour = (user) => {
  // Extract role from user object
  // User has a roles array, so we take the first role
  let userRole = 'salesrep'; // default
  
  if (user?.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    userRole = user.roles[0];
  } else if (user?.role) {
    userRole = user.role;
  } else if (user?.Role) {
    userRole = user.Role;
  }
  
  startTour(userRole);
};