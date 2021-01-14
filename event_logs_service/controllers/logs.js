const {PubSub} = require('@google-cloud/pubsub');
const {BigQuery} = require('@google-cloud/bigquery');

// writes the data to bigquery
module.exports.sendPubSubToBigQueryReq = async (data) => {
    try {
        const pubSubClient = new PubSub();
        console.log(data.length);
        // send each entry log to the bigquery
        const result = await Promise.all(
            data.map(async (event_log) => {
                const dataBuffer = Buffer.from(JSON.stringify(event_log));
                const messageId = await pubSubClient.topic("projects/codeway-backend-case/topics/event").publish(dataBuffer);
                console.log(messageId);
                return messageId;
            })
        );
        
        return { success: true, msg: "Data is successfully published to PubSub.", data: result };
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        return error;
    }
};

module.exports.getEventLogsFromBigQuery = async (data) => {
    try {
        const bigquery = new BigQuery();

        const query = "SELECT * FROM `codeway-backend-case.my_dataset.event_logs`;"

        const options = {
            query: query,
            location: 'US',
        };

        const [job] = await bigquery.createQueryJob(options);
        console.log(`Job ${job.id} started.`);

        const [rows] = await job.getQueryResults();

        return {success: true, msg: "All event logs are in response.", data: rows };
    } catch (error) {
        console.log(error);
        process.exitCode = 1;
        return error;
    }
};

