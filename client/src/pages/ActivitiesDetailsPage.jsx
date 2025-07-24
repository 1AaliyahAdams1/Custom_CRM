//PAGE : Activity Details
//Shows all details related to an individual activity

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


//syncfusion component imports
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { getActivityDetails } from "../services/activityService"; // Make sure this function exists

function ActivitiesDetailsPage() {
  const { id } = useParams(); // Get activity ID from route params
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);  // Holds activity details data
  const [loading, setLoading] = useState(true);    // Loading state for spinner
  const [error, setError] = useState(null);        // Error message

  // Fetch activity details on component mount or when id changes
  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const data = await getActivityDetails(id);  // API call returns array or object
        const activity = Array.isArray(data) ? data[0] : data;
        if (!activity) throw new Error("Activity not found");
        setActivity(activity);
      } catch (err) {
        setError(err.message || "Failed to fetch activity details");
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [id]);


  // Helper to format date/time string or show placeholder
  const formatDate = (str) =>
    str ? new Date(str).toLocaleString() : "-";

  // While loading, show a spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="e-spinner-pane">
          <div className="e-spinner-inner">
            <div className="e-spin-material"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ color: '#d32f2f', fontSize: '16px' }}>{error}</span>
      </div>
    );
  }

  // Show fallback if no activity found
  if (!activity) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ fontSize: '16px' }}>No activity found.</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Back button to go to previous page */}
      <ButtonComponent
        cssClass="e-outline"
        content="← Back to Activities"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      />

      {/* Card-style container using Syncfusion design patterns */}
      <div className="e-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
        {/* Activity title as the header */}
        <div className="e-card-header">
          <div className="e-card-header-title" style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            marginBottom: '24px',
            color: '#333'
          }}>
            Activity #{activity.ActivityID}
          </div>
        </div>

        {/* Card content */}
        <div className="e-card-content">
          {/* Grid layout using CSS Grid to organize details in two columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {/* Left column with main activity info */}
            <div>
              <TooltipComponent content="Associated Account" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Account:</strong> {activity.AccountName || "-"}
                </div>
              </TooltipComponent>

              <TooltipComponent content="Type of activity (e.g., Call, Meeting)" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Type:</strong> {activity.TypeName || "-"}
                </div>
              </TooltipComponent>

              <TooltipComponent content="Detailed description of the activity type" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Description:</strong> {activity.Description || "-"}
                </div>
              </TooltipComponent>
            </div>

            {/* Right column with contact and timestamps */}
            <div>
              <TooltipComponent
                content="Contact person involved in this activity"
                position="TopCenter"
              >
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Contact:</strong>{" "}
                  {activity.ContactID
                    ? `${activity.Title || ""} ${activity.first_name || ""} ${activity.middle_name || ""} ${activity.surname || ""}`.trim()
                    : "-"}
                </div>
              </TooltipComponent>


              <TooltipComponent content="Date and time when the activity occurred" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Date & Time:</strong> {formatDate(activity.Due_date)}
                </div>
              </TooltipComponent>

              <TooltipComponent content="Record creation timestamp" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Created At:</strong> {formatDate(activity.CreatedAt)}
                </div>
              </TooltipComponent>

              <TooltipComponent content="Last update timestamp" position="TopCenter">
                <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Updated At:</strong> {formatDate(activity.UpdatedAt)}
                </div>
              </TooltipComponent>


              <TooltipComponent content="Files uploaded for this activity" position="TopCenter">
                <div style={{ marginTop: '20px' }}>
                  <h4>Attachments</h4>
                  {activity.attachments?.length > 0 ? (
                    activity.attachments.map((att) => (
                      <div key={att.AttachmentID} style={{ marginBottom: '8px', fontSize: '14px' }}>
                        <a href={att.FilePath} target="_blank" rel="noopener noreferrer">
                          {att.FileName}
                        </a>
                        <div><small>Uploaded: {new Date(att.CreatedAt).toLocaleString()}</small></div>
                      </div>
                    ))
                  ) : (
                    <div>No attachments available for this activity.</div>
                  )}
                </div>
              </TooltipComponent>




              <TooltipComponent content="Internal notes for this activity" position="TopCenter">
                <div style={{ marginTop: '20px' }}>
                  <h4>Notes</h4>
                  {activity.notes?.length > 0 ? (
                    activity.notes.map((note) => (
                      <div key={note.NoteID} style={{ marginBottom: '8px', fontSize: '14px' }}>
                        <strong>{note.Content}</strong>
                        <p>{note.Content}</p>
                        <small>Created: {new Date(note.CreatedAt).toLocaleString()}</small>
                      </div>
                    ))
                  ) : (
                    <div>No notes available for this activity.</div>
                  )}
                </div>
              </TooltipComponent>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivitiesDetailsPage;
