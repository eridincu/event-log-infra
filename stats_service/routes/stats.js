const stats = require("../controllers/stats");

module.exports.initialize = (app) => {
    app.get("/daily-active-users", async (req, res) => {
        const result = await stats.getDailyActiveUsers();

        if (result.success) {
            res.respond(200, result.msg, { data: result.data });
        } else {
            console.log(result);
            res.respond(400, "Failed to fetch the daily active users.", { 
                data: result 
            });
        }
    });

    app.get("/daily-avg-durations", async (req, res) => {
        const result = await stats.getDailyAvgDurations();

        if (result.success) {
            res.respond(200, result.msg, { data: result.data });
        } else {
            console.log(result);
            res.respond(400, "Failed to fetch the daily average duration for each user.", { 
                data: result 
            });
        }
    });

    app.get("/total-users", async (req, res) => {
        const result = await stats.getTotalUsers();

        if (result.success) {
            res.respond(200, result.msg, { data: result.data });
        } else {
            console.log(result);
            res.respond(400, "Failed to fetch the all users in event logs.", {
                data: result,
            });
        }
    });
};