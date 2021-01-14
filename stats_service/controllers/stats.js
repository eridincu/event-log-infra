// Import the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

module.exports.getDailyActiveUsers = async (params) => {
    try {
        // Create a client
        const bigquery = new BigQuery();
        // query for sql
        const query = "SELECT user_id, event_time, session_id FROM `codeway-backend-case.my_dataset.event_logs`;"

        const options = {
            query: query,
            location: 'US',
        };

        const [job] = await bigquery.createQueryJob(options);
        console.log(`Job ${job.id} started.`);

        const [rows] = await job.getQueryResults();
        // holds sthe sessions evaluated in the set
        let session_set = new Set();
        let dmy_user_map = {};
        rows.forEach(row => {
            // if the same session is evaluated, skip it since it will be inside the response data.
            if (!session_set.has(row.session_id)) {
                session_set.add(row.session_id);

                const date = new Date(row.event_time); 
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear());
                const dmy = year + "/" + month + "/" + day;
                // init the user count for the specified date. 0 if it is the first user for the given date.
                dmy_user_map[dmy] = (typeof dmy_user_map[dmy] === 'undefined') ? new Set() : dmy_user_map[dmy];
                // increment the user count for the specified date.
                dmy_user_map[dmy].add(row.user_id);
            }
        });
        console.log(dmy_user_map);
        result = {};
        Object.keys(dmy_user_map).forEach(dmy => {
            result[dmy] = dmy_user_map[dmy].size;
        });
        return {success: true, msg: "Number of daily active user by each date is in the data.", data: result };
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        return error;
    }
};

module.exports.getDailyAvgDurations = async (params) => {
    try {
        const bigquery = new BigQuery();
        // get the event logs sorted by the session_id to help calculate the session durations
        const query = "SELECT user_id, event_time, session_id FROM `codeway-backend-case.my_dataset.event_logs` ORDER BY session_id;"

        const options = {
            query: query,
            location: 'US',
        };

        const [job] = await bigquery.createQueryJob(options);
        console.log(`Job ${job.id} started.`);

        const [rows] = await job.getQueryResults();
        
        // holds { user_id, daily_duration } tuples in each value
        let sessions = [];
        let current_session = ""
        let session_beginning_time = 0;
        // find the duration of the each session
        rows.forEach(row => {
            let user_id = row.user_id;
            // session is changed
            if (current_session !== row.session_id) {
                current_session = row.session_id;
                session_beginning_time = Math.floor(row.event_time / 1000);
                sessions.push({ 
                    user_id: user_id,
                    session_duration: 0,  
                });
            }
            // calculate the time difference between the session beginning time with the session's time.
            let session_time = Math.abs(Math.floor(row.event_time / 1000) - session_beginning_time);
            // update the session_time with the longest duration of the session. assumes the user uses the application and stays in the app until the final event.
            if (session_time > sessions[sessions.length - 1].session_duration) {
                sessions[sessions.length - 1] = { user_id: user_id, session_duration: session_time };
            }
        });
        // holds user_id: daily_average_duration pairs
        let result = {};
        // number of sessions for the current user
        let user_session_count = 0;
        // total duration user spent in all of their sessions
        let user_session_durations = 0;
        // the user id for the current user for which the daily average duration is calculated.
        let current_user_id = sessions[0].user_id;
        sessions.forEach(session => {
            // user is changed, calculate the  average time spent in the app
            if (current_user_id !== session.user_id) {
                result[current_user_id] = user_session_durations / user_session_count;
                current_user_id = session.user_id;
                user_session_count = 0;
                user_session_durations = 0;
            }
            // increment the session count for the current user
            user_session_count = user_session_count + 1;
            // add the session duration to the total duration of the current user
            user_session_durations = user_session_durations + session.session_duration;
        });

        return {success: true, msg: "Average daily activity metric(in seconds) for each user is in the data.", data: result };
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        return error;
    }
};

module.exports.getTotalUsers = async (params) => {
    try {
        const bigquery = new BigQuery();

        const query = "SELECT DISTINCT user_id FROM `codeway-backend-case.my_dataset.event_logs`;";

        const options = {
            query: query,
            location: 'US',
        };
    
        const [job] = await bigquery.createQueryJob(options);
        console.log(`Job ${job.id} started.`);

        const [rows] = await job.getQueryResults();
        // get all users and their ids.
        return {success: true, msg: "All Users", data: {rows, num_of_users: rows.length} };
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        return error;
    }
};