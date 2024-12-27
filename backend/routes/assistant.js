// routes/assistant.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const config = require('../config/config');

// This route handles requests to fetch the general context data for a user
router.get('/context/:userId', async (req, res) => {
    const { userId } = req.params;

    // First, we check if the userId parameter is provided
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }

    try {
        // We fetch the relevant data in parallel, including events, members, reminders, tasks, and recommendations
        const [events, members, reminders, tasks, recommendations] = await Promise.all([
            getRelevantEvents(userId),
            getRelevantMembers(userId),
            getReminders(userId),
            getTasks(userId),
            getRecommendations(userId),
            
        ]);

        // Then, we return the context data in a structured response
        res.json({
            success: true,
            data: {
                events,
                members,
                reminders,
                tasks,
                recommendations
            }
        });
    } catch (error) {
        console.error('Error getting context:', error);
        
        // If there's an error, we return a 500 status code and an error message
        res.status(500).json({
            success: false,
            error: 'Error getting context'
        });
    }
});

// These are helper functions that fetch the relevant data from the database


async function getRelevantEvents(userId) {
    try {
        // Here, we'd fetch the upcoming events for the given user
        // We might use a query like:
        // SELECT * FROM events WHERE event_date >= CURDATE() AND member_id = ?
        const [events] = await pool.query(
            'SELECT * FROM events WHERE event_date >= CURDATE() AND member_id = ?',
            [userId]
        );
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}



async function getRelevantMembers(userId) {
    try {
        // Here, we'd fetch the members for the given user
        // We might use a query like:
        // SELECT * FROM members WHERE id != ?
        const [members] = await pool.query(
            'SELECT * FROM members WHERE id != ?',
            [userId]
        );
        return members;
    } catch (error) {
        console.error('Error fetching members:', error);
        return [];
    }
}

async function getReminders(userId) {
    try {
        // Here, we'd fetch the reminders for the given user
        // We might use a query like:
        // SELECT * FROM reminders WHERE user_id = ?
        const [reminders] = await pool.query(
            'SELECT * FROM reminders WHERE user_id = ?',
            [userId]
        );
        return reminders;
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return [];
    }
}

async function getTasks(userId) {
    try {
        // Here, we'd fetch the tasks for the given user
        // We might use a query like:
        // SELECT * FROM tasks WHERE user_id = ?
        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ?',
            [userId]
        );
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

async function getRecommendations(userId) {
    try {
        // Here, we'd fetch the recommendations for the given user
        // We might use a query like:
        // SELECT * FROM recommendations WHERE user_id = ?
        const [recommendations] = await pool.query(
            'SELECT * FROM recommendations WHERE user_id = ?',
            [userId]
        );
        return recommendations;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Finally, we export the router
module.exports = router;