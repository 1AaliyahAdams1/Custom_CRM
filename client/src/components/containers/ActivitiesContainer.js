import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActivitiesPage from "../../pages/ActivitiesPage";
import {
    getAllActivities,
    fetchActivitiesByUser,
    deactivateActivity,
} from "../../services/activityService";

const ActivitiesContainer = () => {
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
    const userId = storedUser.UserID || storedUser.id || null;

    const isCLevel = roles.includes("C-level");
    const isSalesRep = roles.includes("Sales Representative");

    const fetchActivities = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let activitiesData = [];

            console.log("User Roles:", roles);
            console.log("User ID:", userId);

            if (isCLevel) {
                console.log("Fetching all activities for C-level user");
                const response = await getAllActivities(true);
                activitiesData = response || [];
            } else if (isSalesRep && userId) {
                console.log("Fetching activities for Sales Representative");
                const response = await fetchActivitiesByUser(userId);
                activitiesData = response || [];
            } else {
                console.log("No matching role for fetching activities");
                activitiesData = [];
            }

            setActivities(activitiesData);

        } catch (err) {
            console.error("Failed to load activities:", err);
            setError("Failed to load activities. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [refreshFlag]);

    // Automatically clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Filter and search logic
    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const matchesSearch =
                (activity.ActivityType && activity.ActivityType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (activity.AccountName && activity.AccountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (activity.note && activity.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (activity.attachment && activity.attachment.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = !statusFilter ||
                (statusFilter === 'completed' && activity.Completed) ||
                (statusFilter === 'pending' && !activity.Completed);

            const matchesPriority = !priorityFilter ||
                (activity.PriorityLevelID && activity.PriorityLevelID.toString() === priorityFilter);

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [activities, searchTerm, statusFilter, priorityFilter]);

    // Handler to deactivate (soft delete) an activity
    const handleDeactivate = async (id) => {
        const confirm = window.confirm(
            "Are you sure you want to delete this activity? This will deactivate it."
        );
        if (!confirm) return;

        setError(null);
        try {
            console.log("Deactivating (soft deleting) activity with ID:", id);
            await deactivateActivity(id);
            setSuccessMessage("Activity deleted successfully.");
            setRefreshFlag((flag) => !flag);
        } catch (error) {
            console.error("Failed to delete activity:", error);
            setError("Failed to delete activity. Please try again.");
        }
    };

    const handleEdit = (activity) => {
        navigate(`/activities/edit/${activity.ActivityID}`, { state: { activity } });
    };

    const handleView = (activityId) => {
        console.log("Navigating to activity details with ID:", activityId);
        navigate(`/activities/${activityId}`);
    };

    const handleOpenCreate = () => {
        navigate("/activities/create");
    };

    const handleAddNote = (activity) => {
        console.log("Adding note for activity:", activity);
        navigate(`/activities/${activity.ActivityID}/notes`);
    };

    const handleAddAttachment = (activity) => {
        console.log("Adding attachment for activity:", activity);
        navigate(`/activities/${activity.ActivityID}/attachments`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPriorityFilter('');
    };

    return (
        <ActivitiesPage
            activities={filteredActivities}
            loading={loading}
            error={error}
            successMessage={successMessage}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            setSuccessMessage={setSuccessMessage}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            onDeactivate={handleDeactivate}
            onEdit={handleEdit}
            onView={handleView}
            onCreate={handleOpenCreate}
            onAddNote={handleAddNote}
            onAddAttachment={handleAddAttachment}
            clearFilters={clearFilters}
            totalCount={activities.length}
        />
    );
};

export default ActivitiesContainer;