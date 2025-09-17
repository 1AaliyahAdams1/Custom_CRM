import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";

// Mock data will replace
const MOCK_DATA = {
  attendees: [
    {
      AttendeeID: 1,
      PersonFullName: 'Jennifer Anderson',
      WorkEmail: 'jennifer.anderson@techsummit.com',
      WorkPhone: '+1-555-0301',
      JobTitleName: 'Conference Director',
      Company: 'Tech Summit LLC',
      AttendeeType: 'Speaker',
      RegistrationStatus: 'Confirmed',
      CheckedIn: true,
      CreatedAt: '2024-02-15T09:00:00Z',
      Active: true
    },
    {
      AttendeeID: 2,
      PersonFullName: 'Robert Kim',
      WorkEmail: 'robert.kim@innovatetech.com',
      WorkPhone: '+1-555-0302',
      JobTitleName: 'VP of Engineering',
      Company: 'InnovateTech Solutions',
      AttendeeType: 'VIP',
      RegistrationStatus: 'Confirmed',
      CheckedIn: true,
      CreatedAt: '2024-02-18T14:30:00Z',
      Active: true
    },
    {
      AttendeeID: 3,
      PersonFullName: 'Lisa Thompson',
      WorkEmail: 'lisa.thompson@startupworld.com',
      WorkPhone: '+1-555-0303',
      JobTitleName: 'Startup Founder',
      Company: 'StartupWorld Inc',
      AttendeeType: 'Regular',
      RegistrationStatus: 'Confirmed',
      CheckedIn: false,
      CreatedAt: '2024-02-20T16:45:00Z',
      Active: true
    },
    {
      AttendeeID: 4,
      PersonFullName: 'Michael Chen',
      WorkEmail: 'michael.chen@digitalfuture.com',
      WorkPhone: '+1-555-0304',
      JobTitleName: 'Product Manager',
      Company: 'Digital Future Corp',
      AttendeeType: 'Regular',
      RegistrationStatus: 'Waitlist',
      CheckedIn: false,
      CreatedAt: '2024-02-25T11:20:00Z',
      Active: true
    }
  ],
  sessions: [
    {
      SessionID: 1,
      SessionName: 'Opening Keynote: The Future of AI',
      SessionType: 'Keynote',
      StartTime: '2024-04-15T09:00:00Z',
      EndTime: '2024-04-15T10:30:00Z',
      Speaker: 'Dr. Sarah Mitchell',
      Location: 'Main Auditorium',
      MaxCapacity: 500,
      CurrentAttendees: 485,
      Description: 'An inspiring keynote about the future of artificial intelligence and its impact on business',
      CreatedAt: '2024-02-10T10:00:00Z',
      Active: true
    },
    {
      SessionID: 2,
      SessionName: 'Panel: Scaling Startup Operations',
      SessionType: 'Panel Discussion',
      StartTime: '2024-04-15T11:00:00Z',
      EndTime: '2024-04-15T12:30:00Z',
      Speaker: 'Multiple Speakers',
      Location: 'Conference Room A',
      MaxCapacity: 150,
      CurrentAttendees: 127,
      Description: 'Expert panel discussing strategies for scaling startup operations effectively',
      CreatedAt: '2024-02-12T15:30:00Z',
      Active: true
    },
    {
      SessionID: 3,
      SessionName: 'Workshop: Digital Marketing Strategies',
      SessionType: 'Workshop',
      StartTime: '2024-04-15T14:00:00Z',
      EndTime: '2024-04-15T16:00:00Z',
      Speaker: 'Lisa Thompson',
      Location: 'Workshop Room 1',
      MaxCapacity: 50,
      CurrentAttendees: 48,
      Description: 'Hands-on workshop covering the latest digital marketing strategies and tools',
      CreatedAt: '2024-02-14T12:15:00Z',
      Active: true
    },
    {
      SessionID: 4,
      SessionName: 'Networking Break',
      SessionType: 'Networking',
      StartTime: '2024-04-15T16:30:00Z',
      EndTime: '2024-04-15T17:30:00Z',
      Speaker: 'N/A',
      Location: 'Exhibition Hall',
      MaxCapacity: 300,
      CurrentAttendees: 0,
      Description: 'Structured networking session with refreshments and interactive activities',
      CreatedAt: '2024-02-16T09:45:00Z',
      Active: true
    }
  ],
  sponsors: [
    {
      SponsorID: 1,
      CompanyName: 'Microsoft Corporation',
      SponsorshipLevel: 'Platinum',
      SponsorshipAmount: 50000,
      ContactPersonName: 'Amanda Rodriguez',
      ContactEmail: 'amanda.rodriguez@microsoft.com',
      ContactPhone: '+1-555-0401',
      BenefitsProvided: 'Logo placement, exhibition space, speaking slot',
      PaymentStatus: 'Paid',
      CreatedAt: '2024-01-20T10:00:00Z',
      Active: true
    },
    {
      SponsorID: 2,
      CompanyName: 'Google LLC',
      SponsorshipLevel: 'Gold',
      SponsorshipAmount: 25000,
      ContactPersonName: 'David Park',
      ContactEmail: 'david.park@google.com',
      ContactPhone: '+1-555-0402',
      BenefitsProvided: 'Logo placement, exhibition space',
      PaymentStatus: 'Paid',
      CreatedAt: '2024-01-25T14:30:00Z',
      Active: true
    },
    {
      SponsorID: 3,
      CompanyName: 'Amazon Web Services',
      SponsorshipLevel: 'Silver',
      SponsorshipAmount: 15000,
      ContactPersonName: 'Rachel Kim',
      ContactEmail: 'rachel.kim@aws.amazon.com',
      ContactPhone: '+1-555-0403',
      BenefitsProvided: 'Logo placement, promotional materials',
      PaymentStatus: 'Pending',
      CreatedAt: '2024-02-01T11:15:00Z',
      Active: true
    }
  ],
  activities: [
    {
      ActivityID: 1,
      ActivityType: 'Meeting',
      Description: 'Final event planning meeting with venue coordinator and catering team',
      DueToStart: '2024-04-10T10:00:00Z',
      DueToEnd: '2024-04-10T11:30:00Z',
      Completed: false,
      AssignedTo: 'Event Manager',
      CreatedAt: '2024-03-15T14:30:00Z'
    },
    {
      ActivityID: 2,
      ActivityType: 'Task',
      Description: 'Send final event details and agenda to all registered attendees',
      DueToStart: '2024-04-08T09:00:00Z',
      DueToEnd: '2024-04-08T10:00:00Z',
      Completed: true,
      AssignedTo: 'Marketing Coordinator',
      CreatedAt: '2024-03-20T16:00:00Z'
    },
    {
      ActivityID: 3,
      ActivityType: 'Phone Call',
      Description: 'Follow-up call with keynote speaker to confirm technical requirements',
      DueToStart: '2024-04-05T15:00:00Z',
      DueToEnd: '2024-04-05T15:30:00Z',
      Completed: true,
      AssignedTo: 'Technical Coordinator',
      CreatedAt: '2024-03-18T11:20:00Z'
    },
    {
      ActivityID: 4,
      ActivityType: 'Email',
      Description: 'Send sponsor welcome package and event day instructions',
      DueToStart: '2024-04-12T08:00:00Z',
      DueToEnd: '2024-04-12T09:00:00Z',
      Completed: false,
      AssignedTo: 'Sponsor Relations Manager',
      CreatedAt: '2024-03-25T13:45:00Z'
    }
  ],
  notes: [
    {
      NoteID: 1,
      Title: 'Venue Capacity Update',
      Content: 'Venue confirmed maximum capacity of 650 attendees. Fire safety requirements limit main auditorium to 500 people.',
      CreatedBy: 'Event Manager',
      CreatedAt: '2024-03-12T10:30:00Z',
      UpdatedAt: '2024-03-12T10:30:00Z'
    },
    {
      NoteID: 2,
      Title: 'Catering Requirements',
      Content: 'Special dietary requirements: 45 vegetarian, 23 vegan, 12 gluten-free, 8 nut allergies. Catering team confirmed accommodation.',
      CreatedBy: 'Operations Coordinator',
      CreatedAt: '2024-03-18T14:20:00Z',
      UpdatedAt: '2024-03-18T14:20:00Z'
    },
    {
      NoteID: 3,
      Title: 'Audio/Visual Setup',
      Content: 'Live streaming setup confirmed for all keynote sessions. Backup recording equipment arranged for workshop sessions.',
      CreatedBy: 'Technical Manager',
      CreatedAt: '2024-03-20T09:15:00Z',
      UpdatedAt: '2024-03-20T09:15:00Z'
    },
    {
      NoteID: 4,
      Title: 'Sponsor Feedback',
      Content: 'Microsoft requested additional signage placement. Approved premium package upgrade at no extra cost to maintain relationship.',
      CreatedBy: 'Sponsor Relations Manager',
      CreatedAt: '2024-03-22T16:45:00Z',
      UpdatedAt: '2024-03-22T16:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Event_Floor_Plan_Final.pdf',
      FileType: 'PDF',
      FileSize: '5.2 MB',
      UploadedBy: 'Event Manager',
      UploadedAt: '2024-03-15T11:30:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Speaker_Presentation_Guidelines.docx',
      FileType: 'DOCX',
      FileSize: '1.8 MB',
      UploadedBy: 'Program Coordinator',
      UploadedAt: '2024-03-10T15:45:00Z'
    },
    {
      AttachmentID: 3,
      FileName: 'Sponsor_Benefits_Package.pdf',
      FileType: 'PDF',
      FileSize: '3.4 MB',
      UploadedBy: 'Sponsor Relations Manager',
      UploadedAt: '2024-02-28T13:20:00Z'
    },
    {
      AttachmentID: 4,
      FileName: 'Catering_Menu_Final.pdf',
      FileType: 'PDF',
      FileSize: '2.1 MB',
      UploadedBy: 'Operations Coordinator',
      UploadedAt: '2024-03-18T10:15:00Z'
    },
    {
      AttachmentID: 5,
      FileName: 'Event_Marketing_Assets.zip',
      FileType: 'ZIP',
      FileSize: '15.7 MB',
      UploadedBy: 'Marketing Manager',
      UploadedAt: '2024-03-05T14:30:00Z'
    },
    {
      AttachmentID: 6,
      FileName: 'Emergency_Procedures.pdf',
      FileType: 'PDF',
      FileSize: '1.5 MB',
      UploadedBy: 'Safety Coordinator',
      UploadedAt: '2024-03-20T12:00:00Z'
    }
  ]
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  
  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshEvent = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      
      
      // Mock data for now will replace with real API call
      const mockEventData = {
        EventID: parseInt(idRef.current, 10),
        EventName: 'Annual Tech Conference 2024',
        EventType: 'Conference',
        EventDate: '2024-04-15T00:00:00Z',
        StartTime: '09:00:00',
        EndTime: '18:00:00',
        VenueName: 'San Francisco Convention Center',
        VenueAddress: '747 Howard St, San Francisco, CA 94103',
        City: 'San Francisco',
        Country: 'United States',
        ParentCompanyName: 'Tech Events LLC',
        MaxCapacity: 650,
        CurrentRegistrations: 485,
        RegistrationFee: 299.99,
        IsWeekly: false,
        EventStatus: 'Active',
        Description: 'The premier technology conference featuring industry leaders, innovative workshops, and networking opportunities.',
        SpecialInstructions: 'Please arrive 30 minutes early for registration. Professional attire recommended.',
        Website: 'https://techchconf2024.com',
        ContactEmail: 'info@techconf2024.com',
        ContactPhone: '+1-555-0199',
        CreatedDate: '2024-01-15T10:00:00Z',
        UpdatedDate: '2024-03-20T14:30:00Z',
        DateOfEdit: '2024-03-20T14:30:00Z'
      };
      
      setEvent(mockEventData);
    } catch (err) {
      console.error(err);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No event ID provided");
      setLoading(false);
      return;
    }
    refreshEvent();
  }, [id, refreshEvent]);

  
  const handleBack = useCallback(() => {
    navigateRef.current("/events");
  }, []);

  // Define main fields 
  const mainFields = useMemo(() => [
    { key: 'EventName', label: 'Event Name', type: 'text', required: true },
    { key: 'EventType', label: 'Event Type', type: 'text' },
    { key: 'EventDate', label: 'Event Date', type: 'date', required: true },
    { key: 'StartTime', label: 'Start Time', type: 'time' },
    { key: 'EndTime', label: 'End Time', type: 'time' },
    { key: 'VenueName', label: 'Venue Name', type: 'text' },
    { key: 'VenueAddress', label: 'Venue Address', type: 'textarea' },
    { key: 'City', label: 'City', type: 'text' },
    { key: 'Country', label: 'Country', type: 'text' },
    { key: 'ParentCompanyName', label: 'Organizing Company', type: 'text' },
    { key: 'MaxCapacity', label: 'Maximum Capacity', type: 'number' },
    { key: 'CurrentRegistrations', label: 'Current Registrations', type: 'number' },
    { key: 'RegistrationFee', label: 'Registration Fee', type: 'currency' },
    { key: 'IsWeekly', label: 'Weekly Recurring Event', type: 'boolean' },
    { key: 'EventStatus', label: 'Event Status', type: 'text' },
    { key: 'Description', label: 'Event Description', type: 'textarea' },
    { key: 'SpecialInstructions', label: 'Special Instructions', type: 'textarea' },
    { key: 'Website', label: 'Event Website', type: 'link' },
    { key: 'ContactEmail', label: 'Contact Email', type: 'email' },
    { key: 'ContactPhone', label: 'Contact Phone', type: 'phone' },
    { key: 'CreatedDate', label: 'Created Date', type: 'datetime' },
    { key: 'UpdatedDate', label: 'Updated Date', type: 'datetime' },
    { key: 'DateOfEdit', label: 'Last Edited', type: 'datetime' },
  ], []);

 
  const dataServiceRefs = useRef({});
  
  const createStableDataService = useCallback((dataKey, delay = 500) => {
    const cacheKey = `${dataKey}_${delay}`;
    if (!dataServiceRefs.current[cacheKey]) {
      dataServiceRefs.current[cacheKey] = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { data: MOCK_DATA[dataKey] };
      };
    }
    return dataServiceRefs.current[cacheKey];
  }, []);

 
  const processSponsorData = useCallback((data) => {
    return data.map(sponsor => ({
      ...sponsor,
      FormattedAmount: sponsor.SponsorshipAmount 
        ? `$${sponsor.SponsorshipAmount.toLocaleString()}`
        : 'N/A'
    }));
  }, []);

  
  const processSessionData = useCallback((data) => {
    return data.map(session => ({
      ...session,
      CapacityUtilization: session.MaxCapacity 
        ? `${session.CurrentAttendees || 0}/${session.MaxCapacity}`
        : 'N/A',
      UtilizationPercentage: session.MaxCapacity 
        ? Math.round(((session.CurrentAttendees || 0) / session.MaxCapacity) * 100)
        : 0
    }));
  }, []);

  // Define related tabs 
  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'attendees',
        label: 'Attendees',
        entityType: 'attendee',
        tableConfig: {
          idField: 'AttendeeID',
          columns: [
            { field: 'PersonFullName', headerName: 'Name', type: 'text', defaultVisible: true },
            { field: 'WorkEmail', headerName: 'Email', type: 'email', defaultVisible: true },
            { field: 'Company', headerName: 'Company', type: 'text', defaultVisible: true },
            { field: 'JobTitleName', headerName: 'Job Title', type: 'text', defaultVisible: true },
            { field: 'AttendeeType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'RegistrationStatus', headerName: 'Registration', type: 'text', defaultVisible: true },
            { field: 'CheckedIn', headerName: 'Checked In', type: 'boolean', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Registered', type: 'dateTime', defaultVisible: true },
            {
              field: 'Active',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Inactive' },
              chipColors: { true: '#079141ff', false: '#999999' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createStableDataService('attendees', 500)
      },
      {
        key: 'sessions',
        label: 'Sessions',
        entityType: 'session',
        tableConfig: {
          idField: 'SessionID',
          columns: [
            { field: 'SessionName', headerName: 'Session Name', type: 'text', defaultVisible: true },
            { field: 'SessionType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'Speaker', headerName: 'Speaker', type: 'text', defaultVisible: true },
            { field: 'StartTime', headerName: 'Start Time', type: 'dateTime', defaultVisible: true },
            { field: 'EndTime', headerName: 'End Time', type: 'dateTime', defaultVisible: true },
            { field: 'Location', headerName: 'Location', type: 'text', defaultVisible: true },
            { field: 'CapacityUtilization', headerName: 'Capacity', type: 'text', defaultVisible: true },
            { field: 'UtilizationPercentage', headerName: 'Utilization %', type: 'percentage', defaultVisible: true },
            {
              field: 'Active',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Cancelled' },
              chipColors: { true: '#079141ff', false: '#f44336' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createStableDataService('sessions', 600),
        processData: processSessionData
      },
      {
        key: 'sponsors',
        label: 'Sponsors',
        entityType: 'sponsor',
        tableConfig: {
          idField: 'SponsorID',
          columns: [
            { field: 'CompanyName', headerName: 'Company Name', type: 'text', defaultVisible: true },
            { field: 'SponsorshipLevel', headerName: 'Level', type: 'text', defaultVisible: true },
            { field: 'FormattedAmount', headerName: 'Amount', type: 'text', defaultVisible: true },
            { field: 'ContactPersonName', headerName: 'Contact Person', type: 'text', defaultVisible: true },
            { field: 'ContactEmail', headerName: 'Contact Email', type: 'email', defaultVisible: true },
            { field: 'PaymentStatus', headerName: 'Payment Status', type: 'text', defaultVisible: true },
            { field: 'BenefitsProvided', headerName: 'Benefits', type: 'truncated', maxWidth: 300, defaultVisible: true },
            {
              field: 'Active',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Inactive' },
              chipColors: { true: '#079141ff', false: '#999999' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createStableDataService('sponsors', 700),
        processData: processSponsorData
      },
      {
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'ActivityType', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'Description', headerName: 'Description', type: 'truncated', maxWidth: 300, defaultVisible: true },
            { field: 'AssignedTo', headerName: 'Assigned To', type: 'text', defaultVisible: true },
            { field: 'DueToStart', headerName: 'Due Date', type: 'date', defaultVisible: true },
            { field: 'Completed', headerName: 'Completed', type: 'boolean', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createStableDataService('activities', 600)
      },
      {
        key: 'notes',
        label: 'Notes',
        entityType: 'note',
        tableConfig: {
          idField: 'NoteID',
          columns: [
            { field: 'Title', headerName: 'Title', type: 'text', defaultVisible: true },
            { field: 'Content', headerName: 'Content', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'CreatedBy', headerName: 'Created By', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
          ]
        },
        dataService: createStableDataService('notes', 400)
      },
      {
        key: 'attachments',
        label: 'Attachments',
        entityType: 'attachment',
        tableConfig: {
          idField: 'AttachmentID',
          columns: [
            { field: 'FileName', headerName: 'File Name', type: 'text', defaultVisible: true },
            { field: 'FileType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'FileSize', headerName: 'Size', type: 'text', defaultVisible: true },
            { field: 'UploadedBy', headerName: 'Uploaded By', type: 'text', defaultVisible: true },
            { field: 'UploadedAt', headerName: 'Uploaded', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createStableDataService('attachments', 300)
      }
    ];
    return tabs;
  }, [createStableDataService, processSponsorData, processSessionData]);

  //  action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
      attendee: {
        view: (attendee) => navigateRef.current(`/attendees/${attendee.AttendeeID}`),
        edit: (attendee) => navigateRef.current(`/attendees/${attendee.AttendeeID}/edit`),
        delete: async (attendee) => {
          console.log('Delete attendee:', attendee);
        },
        checkIn: (attendee) => {
          console.log('Check in attendee:', attendee);
        },
        sendEmail: (attendee) => {
          console.log('Send email to attendee:', attendee);
        }
      },
      session: {
        view: (session) => navigateRef.current(`/sessions/${session.SessionID}`),
        edit: (session) => navigateRef.current(`/sessions/${session.SessionID}/edit`),
        delete: async (session) => {
          console.log('Delete session:', session);
        },
        manageAttendees: (session) => {
          console.log('Manage session attendees:', session);
        },
        addNote: (session) => {
          console.log('Add note to session:', session);
        }
      },
      sponsor: {
        view: (sponsor) => navigateRef.current(`/sponsors/${sponsor.SponsorID}`),
        edit: (sponsor) => navigateRef.current(`/sponsors/${sponsor.SponsorID}/edit`),
        delete: async (sponsor) => {
          console.log('Delete sponsor:', sponsor);
        },
        sendInvoice: (sponsor) => {
          console.log('Send invoice to sponsor:', sponsor);
        },
        addNote: (sponsor) => {
          console.log('Add note to sponsor:', sponsor);
        }
      },
      activity: {
        view: (activity) => navigateRef.current(`/activities/${activity.ActivityID}`),
        edit: (activity) => navigateRef.current(`/activities/${activity.ActivityID}/edit`),
        delete: async (activity) => {
          console.log('Delete activity:', activity);
        },
        complete: (activity) => {
          console.log('Mark activity complete:', activity);
        },
        addNote: (activity) => {
          console.log('Add note to activity:', activity);
        }
      },
      note: {
        view: (note) => {
          console.log('View note:', note);
        },
        edit: (note) => {
          console.log('Edit note:', note);
        },
        delete: async (note) => {
          console.log('Delete note:', note);
        }
      },
      attachment: {
        view: (attachment) => {
          console.log('View attachment:', attachment);
        },
        download: (attachment) => {
          console.log('Download attachment:', attachment);
        },
        delete: async (attachment) => {
          console.log('Delete attachment:', attachment);
        }
      }
    };
    return actions;
  }, []);

  // Header chips 
  const headerChips = useMemo(() => {
    if (!event) return [];
    
    const chips = [];
    
    // Event status chip
    if (event.EventStatus) {
      chips.push({
        label: event.EventStatus,
        color: event.EventStatus === 'Active' ? '#079141ff' : 
               event.EventStatus === 'Cancelled' ? '#f44336' : 
               event.EventStatus === 'Postponed' ? '#ff9800' : '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    // Recurring event chip
    if (event.IsWeekly) {
      chips.push({
        label: 'Weekly Recurring',
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    // Event type chip
    if (event.EventType) {
      chips.push({
        label: event.EventType,
        color: '#9c27b0',
        textColor: '#ffffff'
      });
    }
    
    // Capacity status chip
    if (event.MaxCapacity && event.CurrentRegistrations) {
      const utilizationPercentage = (event.CurrentRegistrations / event.MaxCapacity) * 100;
      chips.push({
        label: `${event.CurrentRegistrations}/${event.MaxCapacity} registered`,
        color: utilizationPercentage >= 90 ? '#f44336' : 
               utilizationPercentage >= 75 ? '#ff9800' : '#4caf50',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [event?.EventStatus, event?.IsWeekly, event?.EventType, event?.MaxCapacity, event?.CurrentRegistrations]);

  //  event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving event:', formData);
      setSuccessMessage('Event updated successfully');
      await refreshEvent();
    } catch (err) {
      setError('Failed to update event');
    }
  }, [refreshEvent]);

  const handleDelete = useCallback(async (formData) => {
    try {
      console.log('Deleting event:', formData);
      navigateRef.current('/events');
    } catch (err) {
      setError('Failed to delete event');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to event:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to event:', item);
  }, []);

  if (loading) return <Typography>Loading event details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!event) return <Alert severity="warning">Event not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={event.EventName || 'Event Details'}
        subtitle={`Event ID: ${event.EventID} ${event.EventDate ? `• ${new Date(event.EventDate).toLocaleDateString()}` : ''} ${event.VenueName && event.City ? `• ${event.VenueName}, ${event.City}` : ''}`}
        item={event}
        mainFields={mainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="event"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}