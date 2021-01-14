const logs = require("../controllers/logs");

module.exports.initialize = (app) => {
    app.post("/get-logs", async (req, res) => {
        const result = await logs.getEventLogsFromBigQuery(req.body);
        if (result.success) {
            res.respond(200, result.msg, { data: result.data });
        } else {
            console.log(result);
            res.respond(400, "Something is wrong.", {
                data: result,
            });
        }
    });

    app.post("/write-logs",  async (req, res) => {   
        const result = await logs.sendPubSubToBigQueryReq(req.body);
        if (result.success) {
            res.respond(200, result.msg, { 
                data: result.data
            });
        } else {
            console.log(result);
            res.respond(400, "Something is wrong.", {
                data: result,
            })
        }
    });
}