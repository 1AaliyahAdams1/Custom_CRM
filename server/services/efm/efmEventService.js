const axios = require('axios');
const eventsData = require('../../data/efm/efmEventRepository');
const efmConfig = require('../../efmConfig'); 

// Fetch events from EFM (bulk export with sinceId)
const fetchEventsFromEFM = async (sinceId = 0) => {
    try {
        const url = `${efmConfig.baseURL}/events/bulk-export?sinceId=${sinceId}&apikey=${efmConfig.apiKey}`;
        const res = await axios.get(url);

        // Safely extract the events array
        return res.data?.data?.events || [];
    } catch (err) {
        console.error('Error fetching events from EFM:', err.message);
        return [];
    }
};

// Sync events into local DB
const syncEvents = async (startingSinceId = 0) => {
    let sinceId = startingSinceId;
    let more = true;
    let totalSynced = 0;

    while (more) {
        const events = await fetchEventsFromEFM(sinceId);

        if (!events.length) {
            more = false;
            break;
        }

        for (const event of events) {
            await eventsData.insertOrUpdateEvent(event);
            sinceId = Math.max(sinceId, event.eventID);
            totalSynced++;
        }
    }

    return { 
        success: true, 
        message: 'Events synced successfully', 
        totalSynced 
    };
};

module.exports = { syncEvents };
