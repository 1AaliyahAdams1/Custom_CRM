import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";

// Memoized mock data will replace
const MOCK_DATA = {
  usage: [
    {
      UsageID: 1,
      CustomerName: 'TechCorp Solutions',
      CustomerEmail: 'billing@techcorp.com',
      EventName: 'Annual Tech Conference 2024',
      UsageDate: '2024-03-15T14:30:00Z',
      DiscountAmount: 500.00,
      OrderTotal: 2500.00,
      OrderID: 'ORD-2024-001',
      PaymentStatus: 'Completed',
      RefundStatus: 'None',
      CreatedAt: '2024-03-15T14:30:00Z',
      Active: true
    },
    {
      UsageID: 2,
      CustomerName: 'StartupWorld Inc',
      CustomerEmail: 'events@startupworld.com',
      EventName: 'Innovation Summit 2024',
      UsageDate: '2024-03-20T10:15:00Z',
      DiscountAmount: 750.00,
      OrderTotal: 3750.00,
      OrderID: 'ORD-2024-002',
      PaymentStatus: 'Completed',
      RefundStatus: 'None',
      CreatedAt: '2024-03-20T10:15:00Z',
      Active: true
    },
    {
      UsageID: 3,
      CustomerName: 'Digital Future Corp',
      CustomerEmail: 'purchasing@digitalfuture.com',
      EventName: 'Leadership Workshop Series',
      UsageDate: '2024-03-25T16:45:00Z',
      DiscountAmount: 300.00,
      OrderTotal: 1500.00,
      OrderID: 'ORD-2024-003',
      PaymentStatus: 'Pending',
      RefundStatus: 'None',
      CreatedAt: '2024-03-25T16:45:00Z',
      Active: true
    }
  ],
  approvals: [
    {
      ApprovalID: 1,
      ApprovalType: 'Manager Approval',
      ApproverName: 'Sarah Mitchell',
      ApproverEmail: 'sarah.mitchell@company.com',
      ApprovalStatus: 'Approved',
      ApprovalDate: '2024-02-28T11:30:00Z',
      ApprovalNotes: 'Approved for enterprise customer with multiple event commitment',
      RequestedBy: 'Sales Manager',
      RequestedDate: '2024-02-25T14:20:00Z',
      CreatedAt: '2024-02-25T14:20:00Z'
    },
    {
      ApprovalID: 2,
      ApprovalType: 'Finance Review',
      ApproverName: 'Michael Chen',
      ApproverEmail: 'michael.chen@company.com',
      ApprovalStatus: 'Approved',
      ApprovalDate: '2024-02-28T15:45:00Z',
      ApprovalNotes: 'Financial impact reviewed and approved within discount budget guidelines',
      RequestedBy: 'Account Manager',
      RequestedDate: '2024-02-26T09:10:00Z',
      CreatedAt: '2024-02-26T09:10:00Z'
    },
    {
      ApprovalID: 3,
      ApprovalType: 'Legal Review',
      ApproverName: 'Jennifer Rodriguez',
      ApproverEmail: 'jennifer.rodriguez@company.com',
      ApprovalStatus: 'Pending',
      ApprovalDate: null,
      ApprovalNotes: 'Under review for compliance with pricing policies',
      RequestedBy: 'Business Development',
      RequestedDate: '2024-03-22T13:15:00Z',
      CreatedAt: '2024-03-22T13:15:00Z'
    }
  ],
  auditLog: [
    {
      AuditID: 1,
      ActionType: 'Created',
      ActionBy: 'John Smith',
      ActionDate: '2024-02-20T10:00:00Z',
      ActionDetails: 'Discount code created with 20% discount for enterprise customers',
      IPAddress: '192.168.1.100',
      UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      CreatedAt: '2024-02-20T10:00:00Z'
    },
    {
      AuditID: 2,
      ActionType: 'Modified',
      ActionBy: 'Sarah Wilson',
      ActionDate: '2024-02-25T14:30:00Z',
      ActionDetails: 'Updated expiration date from March 31 to June 30, 2024',
      IPAddress: '192.168.1.105',
      UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      CreatedAt: '2024-02-25T14:30:00Z'
    },
    {
      AuditID: 3,
      ActionType: 'Activated',
      ActionBy: 'Manager System',
      ActionDate: '2024-03-01T09:00:00Z',
      ActionDetails: 'Discount code activated after approval workflow completion',
      IPAddress: '10.0.0.1',
      UserAgent: 'System/1.0',
      CreatedAt: '2024-03-01T09:00:00Z'
    },
    {
      AuditID: 4,
      ActionType: 'Used',
      ActionBy: 'Customer Portal',
      ActionDate: '2024-03-15T14:30:00Z',
      ActionDetails: 'Code redeemed by TechCorp Solutions for order ORD-2024-001',
      IPAddress: '203.0.113.45',
      UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      CreatedAt: '2024-03-15T14:30:00Z'
    },
    {
      AuditID: 5,
      ActionType: 'Locked',
      ActionBy: 'Security System',
      ActionDate: '2024-03-20T16:00:00Z',
      ActionDetails: 'Code automatically locked after maximum usage limit reached',
      IPAddress: '10.0.0.1',
      UserAgent: 'Security/2.1',
      CreatedAt: '2024-03-20T16:00:00Z'
    }
  ],
  restrictions: [
    {
      RestrictionID: 1,
      RestrictionType: 'Company Restriction',
      RestrictionValue: 'TechCorp Solutions, StartupWorld Inc, Digital Future Corp',
      RestrictionDescription: 'Code can only be used by specified enterprise customers',
      IsActive: true,
      CreatedBy: 'Account Manager',
      CreatedAt: '2024-02-20T10:30:00Z'
    },
    {
      RestrictionID: 2,
      RestrictionType: 'Event Category Restriction',
      RestrictionValue: 'Conference, Workshop, Summit',
      RestrictionDescription: 'Valid only for conference-type events, workshops, and summits',
      IsActive: true,
      CreatedBy: 'Event Manager',
      CreatedAt: '2024-02-20T10:35:00Z'
    },
    {
      RestrictionID: 3,
      RestrictionType: 'Minimum Order Value',
      RestrictionValue: '$1,000.00',
      RestrictionDescription: 'Order must be minimum $1,000 to qualify for discount',
      IsActive: true,
      CreatedBy: 'Finance Team',
      CreatedAt: '2024-02-20T10:40:00Z'
    },
    {
      RestrictionID: 4,
      RestrictionType: 'Geographic Restriction',
      RestrictionValue: 'North America, Europe',
      RestrictionDescription: 'Code valid only for events in North America and Europe',
      IsActive: true,
      CreatedBy: 'Regional Manager',
      CreatedAt: '2024-02-20T11:00:00Z'
    }
  ],
  activities: [
    {
      ActivityID: 1,
      ActivityType: 'Email',
      Description: 'Send discount code notification to approved enterprise customers',
      DueToStart: '2024-03-05T09:00:00Z',
      DueToEnd: '2024-03-05T10:00:00Z',
      Completed: true,
      AssignedTo: 'Marketing Coordinator',
      CreatedAt: '2024-02-28T16:00:00Z'
    },
    {
      ActivityID: 2,
      ActivityType: 'Task',
      Description: 'Review usage patterns and prepare monthly discount code performance report',
      DueToStart: '2024-04-01T14:00:00Z',
      DueToEnd: '2024-04-01T16:00:00Z',
      Completed: false,
      AssignedTo: 'Business Analyst',
      CreatedAt: '2024-03-15T11:30:00Z'
    },
    {
      ActivityID: 3,
      ActivityType: 'Phone Call',
      Description: 'Follow-up call with customers who received but haven\'t used the discount code',
      DueToStart: '2024-04-10T10:00:00Z',
      DueToEnd: '2024-04-10T12:00:00Z',
      Completed: false,
      AssignedTo: 'Sales Representative',
      CreatedAt: '2024-03-20T13:45:00Z'
    }
  ],
  notes: [
    {
      NoteID: 1,
      Title: 'Enterprise Customer Strategy',
      Content: 'This discount code is part of our Q1 enterprise customer retention strategy. Focus on customers with multiple event commitments.',
      CreatedBy: 'Sales Director',
      CreatedAt: '2024-02-20T11:15:00Z',
      UpdatedAt: '2024-02-20T11:15:00Z'
    },
    {
      NoteID: 2,
      Title: 'Usage Pattern Analysis',
      Content: 'Early usage shows strong adoption among tech companies. Consider creating similar codes for other industry verticals.',
      CreatedBy: 'Marketing Manager',
      CreatedAt: '2024-03-18T14:20:00Z',
      UpdatedAt: '2024-03-18T14:20:00Z'
    },
    {
      NoteID: 3,
      Title: 'Compliance Requirements',
      Content: 'Legal team confirmed this discount structure complies with pricing discrimination policies. Documentation filed.',
      CreatedBy: 'Legal Counsel',
      CreatedAt: '2024-02-28T16:45:00Z',
      UpdatedAt: '2024-02-28T16:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Discount_Code_Approval_Form.pdf',
      FileType: 'PDF',
      FileSize: '2.3 MB',
      UploadedBy: 'Sales Manager',
      UploadedAt: '2024-02-25T15:30:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Enterprise_Customer_List.xlsx',
      FileType: 'XLSX',
      FileSize: '1.2 MB',
      UploadedBy: 'Account Manager',
      UploadedAt: '2024-02-20T12:00:00Z'
    },
    {
      AttachmentID: 3,
      FileName: 'Legal_Review_Documentation.docx',
      FileType: 'DOCX',
      FileSize: '3.1 MB',
      UploadedBy: 'Legal Counsel',
      UploadedAt: '2024-02-28T17:00:00Z'
    },
    {
      AttachmentID: 4,
      FileName: 'Marketing_Email_Template.html',
      FileType: 'HTML',
      FileSize: '156 KB',
      UploadedBy: 'Marketing Coordinator',
      UploadedAt: '2024-03-01T10:15:00Z'
    }
  ]
};

export default function DiscountCodeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  

  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [discountCode, setDiscountCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

 
  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshDiscountCode = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      
      
      // Mock data for now will replace with real API call
      const mockDiscountCodeData = {
        DiscountCodeID: parseInt(idRef.current, 10),
        DiscountCode: 'ENTERPRISE20',
        DiscountPercentage: 20,
        DiscountAmount: null,
        CompanyName: 'TechCorp Solutions',
        CompanyID: 1,
        Description: 'Enterprise customer discount for multiple event bookings',
        IsActive: true,
        IsExpired: false,
        ValidFrom: '2024-02-01T00:00:00Z',
        ValidUntil: '2024-06-30T23:59:59Z',
        OneTime: false,
        MaxUsages: 10,
        CurrentUsages: 3,
        MinEvents: 2,
        MaxEvents: 50,
        MinCommitted: 1000.00,
        Locked: false,
        Redeemed: true,
        RequiresApproval: true,
        ApprovalStatus: 'Approved',
        CreatedBy: 1,
        CreatedByUserName: 'John Smith',
        LastEditedByUserID: 2,
        LastEditedByUserName: 'Sarah Wilson',
        CreateDate: '2024-02-20T00:00:00Z',
        LastEditedDT: '2024-02-25T14:30:00Z',
        CreatedDate: '2024-02-20T10:00:00Z',
        UpdatedDate: '2024-02-25T14:30:00Z'
      };
      
      setDiscountCode(mockDiscountCodeData);
    } catch (err) {
      console.error(err);
      setError("Failed to load discount code details");
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (!id) {
      setError("No discount code ID provided");
      setLoading(false);
      return;
    }
    refreshDiscountCode();
  }, [id, refreshDiscountCode]);

  
  const handleBack = useCallback(() => {
    navigateRef.current("/discount-codes");
  }, []);

  // Define main fields 
  const mainFields = useMemo(() => [
    { key: 'DiscountCode', label: 'Discount Code', type: 'text', required: true },
    { key: 'DiscountPercentage', label: 'Discount Percentage (%)', type: 'number', required: true },
    { key: 'DiscountAmount', label: 'Fixed Discount Amount', type: 'currency' },
    { key: 'CompanyName', label: 'Associated Company', type: 'text' },
    { key: 'Description', label: 'Code Description', type: 'textarea' },
    { key: 'IsActive', label: 'Active Status', type: 'boolean' },
    { key: 'IsExpired', label: 'Expired', type: 'boolean' },
    { key: 'ValidFrom', label: 'Valid From', type: 'date' },
    { key: 'ValidUntil', label: 'Valid Until', type: 'date' },
    { key: 'OneTime', label: 'One-Time Use Only', type: 'boolean' },
    { key: 'MaxUsages', label: 'Maximum Usages', type: 'number' },
    { key: 'CurrentUsages', label: 'Current Usage Count', type: 'number' },
    { key: 'MinEvents', label: 'Minimum Events Required', type: 'number' },
    { key: 'MaxEvents', label: 'Maximum Events Allowed', type: 'number' },
    { key: 'MinCommitted', label: 'Minimum Commitment Amount', type: 'currency' },
    { key: 'Locked', label: 'Locked Status', type: 'boolean' },
    { key: 'Redeemed', label: 'Redeemed Status', type: 'boolean' },
    { key: 'RequiresApproval', label: 'Requires Approval', type: 'boolean' },
    { key: 'ApprovalStatus', label: 'Approval Status', type: 'text' },
    { key: 'CreatedBy', label: 'Created By User ID', type: 'number' },
    { key: 'CreatedByUserName', label: 'Created By', type: 'text' },
    { key: 'LastEditedByUserID', label: 'Last Edited By User ID', type: 'number' },
    { key: 'LastEditedByUserName', label: 'Last Edited By', type: 'text' },
    { key: 'CreateDate', label: 'Create Date', type: 'date' },
    { key: 'LastEditedDT', label: 'Last Edited', type: 'datetime' },
    { key: 'CreatedDate', label: 'Created Date', type: 'datetime' },
    { key: 'UpdatedDate', label: 'Updated Date', type: 'datetime' },
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

  
  const processUsageData = useCallback((data) => {
    return data.map(usage => ({
      ...usage,
      DiscountAmountFormatted: `$${usage.DiscountAmount?.toLocaleString() || '0'}`,
      OrderTotalFormatted: `$${usage.OrderTotal?.toLocaleString() || '0'}`,
      SavingsPercentage: usage.OrderTotal ? Math.round((usage.DiscountAmount / usage.OrderTotal) * 100) : 0
    }));
  }, []);

  // Define related tabs 
  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'usage',
        label: 'Usage History',
        entityType: 'usage',
        tableConfig: {
          idField: 'UsageID',
          columns: [
            { field: 'CustomerName', headerName: 'Customer', type: 'text', defaultVisible: true },
            { field: 'CustomerEmail', headerName: 'Customer Email', type: 'email', defaultVisible: true },
            { field: 'EventName', headerName: 'Event', type: 'text', defaultVisible: true },
            { field: 'UsageDate', headerName: 'Used Date', type: 'dateTime', defaultVisible: true },
            { field: 'DiscountAmountFormatted', headerName: 'Discount Applied', type: 'text', defaultVisible: true },
            { field: 'OrderTotalFormatted', headerName: 'Order Total', type: 'text', defaultVisible: true },
            { field: 'SavingsPercentage', headerName: 'Savings %', type: 'percentage', defaultVisible: true },
            { field: 'OrderID', headerName: 'Order ID', type: 'text', defaultVisible: true },
            { field: 'PaymentStatus', headerName: 'Payment Status', type: 'text', defaultVisible: true },
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
        dataService: createStableDataService('usage', 500),
        processData: processUsageData
      },
      {
        key: 'approvals',
        label: 'Approvals',
        entityType: 'approval',
        tableConfig: {
          idField: 'ApprovalID',
          columns: [
            { field: 'ApprovalType', headerName: 'Approval Type', type: 'text', defaultVisible: true },
            { field: 'ApproverName', headerName: 'Approver', type: 'text', defaultVisible: true },
            { field: 'ApprovalStatus', headerName: 'Status', type: 'text', defaultVisible: true },
            { field: 'ApprovalDate', headerName: 'Approval Date', type: 'dateTime', defaultVisible: true },
            { field: 'RequestedBy', headerName: 'Requested By', type: 'text', defaultVisible: true },
            { field: 'RequestedDate', headerName: 'Requested Date', type: 'dateTime', defaultVisible: true },
            { field: 'ApprovalNotes', headerName: 'Notes', type: 'truncated', maxWidth: 300, defaultVisible: true },
          ]
        },
        dataService: createStableDataService('approvals', 600)
      },
      {
        key: 'auditLog',
        label: 'Audit Log',
        entityType: 'audit',
        tableConfig: {
          idField: 'AuditID',
          columns: [
            { field: 'ActionType', headerName: 'Action', type: 'text', defaultVisible: true },
            { field: 'ActionBy', headerName: 'Performed By', type: 'text', defaultVisible: true },
            { field: 'ActionDate', headerName: 'Date/Time', type: 'dateTime', defaultVisible: true },
            { field: 'ActionDetails', headerName: 'Details', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'IPAddress', headerName: 'IP Address', type: 'text', defaultVisible: false },
            { field: 'UserAgent', headerName: 'User Agent', type: 'truncated', maxWidth: 200, defaultVisible: false },
          ]
        },
        dataService: createStableDataService('auditLog', 400)
      },
      {
        key: 'restrictions',
        label: 'Restrictions',
        entityType: 'restriction',
        tableConfig: {
          idField: 'RestrictionID',
          columns: [
            { field: 'RestrictionType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'RestrictionValue', headerName: 'Value', type: 'truncated', maxWidth: 250, defaultVisible: true },
            { field: 'RestrictionDescription', headerName: 'Description', type: 'truncated', maxWidth: 300, defaultVisible: true },
            { field: 'CreatedBy', headerName: 'Created By', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            {
              field: 'IsActive',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Inactive' },
              chipColors: { true: '#079141ff', false: '#999999' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createStableDataService('restrictions', 700)
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
  }, [createStableDataService, processUsageData]);

  // action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
      usage: {
        viewOrder: (usage) => navigateRef.current(`/orders/${usage.OrderID}`),
        viewCustomer: (usage) => {
          console.log('View customer:', usage.CustomerName);
        },
        viewEvent: (usage) => {
          console.log('View event:', usage.EventName);
        },
        processRefund: (usage) => {
          console.log('Process refund for usage:', usage);
        }
      },
      approval: {
        view: (approval) => {
          console.log('View approval details:', approval);
        },
        approve: (approval) => {
          console.log('Approve:', approval);
        },
        reject: (approval) => {
          console.log('Reject:', approval);
        },
        requestInfo: (approval) => {
          console.log('Request additional info:', approval);
        }
      },
      audit: {
        view: (audit) => {
          console.log('View audit details:', audit);
        },
        exportLog: (audit) => {
          console.log('Export audit log:', audit);
        }
      },
      restriction: {
        edit: (restriction) => {
          console.log('Edit restriction:', restriction);
        },
        delete: (restriction) => {
          console.log('Delete restriction:', restriction);
        },
        toggle: (restriction) => {
          console.log('Toggle restriction:', restriction);
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
    if (!discountCode) return [];
    
    const chips = [];
    
    // Active status chip
    chips.push({
      label: discountCode.IsActive ? 'Active' : 'Inactive',
      color: discountCode.IsActive ? '#4caf50' : '#757575',
      textColor: '#ffffff'
    });
    
    // Expiry status chip
    if (discountCode.IsExpired) {
      chips.push({
        label: 'Expired',
        color: '#f44336',
        textColor: '#ffffff'
      });
    } else if (discountCode.ValidUntil) {
      chips.push({
        label: `Valid until ${new Date(discountCode.ValidUntil).toLocaleDateString()}`,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    // Usage type chip
    chips.push({
      label: discountCode.OneTime ? 'One-Time Use' : 'Multiple Use',
      color: discountCode.OneTime ? '#ff9800' : '#2196f3',
      textColor: '#ffffff'
    });
    
    // Redeemed status chip
    if (discountCode.Redeemed) {
      chips.push({
        label: 'Redeemed',
        color: '#9c27b0',
        textColor: '#ffffff'
      });
    }
    
    // Locked status chip
    if (discountCode.Locked) {
      chips.push({
        label: 'Locked',
        color: '#f44336',
        textColor: '#ffffff'
      });
    }
    
    // Approval status chip
    if (discountCode.RequiresApproval) {
      const approvalColor = discountCode.ApprovalStatus === 'Approved' ? '#4caf50' : 
                           discountCode.ApprovalStatus === 'Rejected' ? '#f44336' : '#ff9800';
      chips.push({
        label: discountCode.ApprovalStatus || 'Pending Approval',
        color: approvalColor,
        textColor: '#ffffff'
      });
    }
    
    // Usage count chip if applicable
    if (discountCode.MaxUsages && discountCode.CurrentUsages !== undefined) {
      chips.push({
        label: `${discountCode.CurrentUsages}/${discountCode.MaxUsages} uses`,
        color: discountCode.CurrentUsages >= discountCode.MaxUsages ? '#f44336' : '#4caf50',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [
    discountCode?.IsActive,
    discountCode?.IsExpired,
    discountCode?.ValidUntil,
    discountCode?.OneTime,
    discountCode?.Redeemed,
    discountCode?.Locked,
    discountCode?.RequiresApproval,
    discountCode?.ApprovalStatus,
    discountCode?.MaxUsages,
    discountCode?.CurrentUsages
  ]);

  // event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving discount code:', formData);
      setSuccessMessage('Discount code updated successfully');
      await refreshDiscountCode();
    } catch (err) {
      setError('Failed to update discount code');
    }
  }, [refreshDiscountCode]);

  const handleDelete = useCallback(async (formData) => {
    try {
      console.log('Deleting discount code:', formData);
      navigateRef.current('/discount-codes');
    } catch (err) {
      setError('Failed to delete discount code');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to discount code:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to discount code:', item);
  }, []);

  // Custom action handlers specific to discount codes
  const handleActivate = useCallback(async () => {
    try {
      console.log('Activating discount code:', discountCode.DiscountCodeID);
      setSuccessMessage('Discount code activated successfully');
      await refreshDiscountCode();
    } catch (err) {
      setError('Failed to activate discount code');
    }
  }, [discountCode?.DiscountCodeID, refreshDiscountCode]);

  const handleLock = useCallback(async () => {
    try {
      console.log('Locking discount code:', discountCode.DiscountCodeID);
      setSuccessMessage('Discount code locked successfully');
      await refreshDiscountCode();
    } catch (err) {
      setError('Failed to lock discount code');
    }
  }, [discountCode?.DiscountCodeID, refreshDiscountCode]);

  const handleUnlock = useCallback(async () => {
    try {
      console.log('Unlocking discount code:', discountCode.DiscountCodeID);
      setSuccessMessage('Discount code unlocked successfully');
      await refreshDiscountCode();
    } catch (err) {
      setError('Failed to unlock discount code');
    }
  }, [discountCode?.DiscountCodeID, refreshDiscountCode]);

  const handleApprove = useCallback(async () => {
    try {
      console.log('Approving discount code:', discountCode.DiscountCodeID);
      setSuccessMessage('Discount code approved successfully');
      await refreshDiscountCode();
    } catch (err) {
      setError('Failed to approve discount code');
    }
  }, [discountCode?.DiscountCodeID, refreshDiscountCode]);

  if (loading) return <Typography>Loading discount code details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!discountCode) return <Alert severity="warning">Discount code not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={discountCode.DiscountCode || 'Discount Code Details'}
        subtitle={`Code ID: ${discountCode.DiscountCodeID} ${discountCode.DiscountPercentage ? `• ${discountCode.DiscountPercentage}% discount` : ''} ${discountCode.CompanyName ? `• ${discountCode.CompanyName}` : ''}`}
        item={discountCode}
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
        entityType="discount-code"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
        customActions={[
          ...(discountCode.Locked 
            ? [{
                label: 'Unlock Code',
                icon: 'UnlockIcon',
                action: handleUnlock,
                color: 'success',
                variant: 'outlined'
              }]
            : [{
                label: 'Lock Code',
                icon: 'LockIcon',
                action: handleLock,
                color: 'warning',
                variant: 'outlined'
              }]
          ),
          ...(!discountCode.IsActive 
            ? [{
                label: 'Activate Code',
                icon: 'VisibilityIcon',
                action: handleActivate,
                color: 'success',
                variant: 'contained'
              }]
            : []
          ),
          ...(discountCode.RequiresApproval && discountCode.ApprovalStatus !== 'Approved'
            ? [{
                label: 'Approve Code',
                icon: 'CheckCircleIcon',
                action: handleApprove,
                color: 'primary',
                variant: 'contained'
              }]
            : []
          )
        ]}
      />
    </Box>
  );
}