const express = require('express');
const routes = require("./routes/logs");
const cors = require("cors");
const bodyParser = require("body-parser");
const { BigQuery } = require('@google-cloud/bigquery');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();

express.response.respond = function (code, message, data) {
  this.status(code).send({
    status: { code, message },
    data,
  });
};

const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
routes.initialize(app);
app.listen(port, () => {
    console.log(`helloworld: listening on port ${port}`);
});

module.exports.App = app;

main();

async function main() {
    try {
        const datasetId = "my_dataset";
        const tableId = "event_logs";
        // Initialize the dataset.
        const datasetExists = await checkIfDatasetExist(datasetId);
        if (!datasetExists[0]) {
            console.log("Create the dataset: " + datasetId);
            await createDataset(datasetId);
        }
        // Initialize the table for event logs.
        const tableExists = await checkIfTableExist(datasetId, tableId);
        if (!tableExists[0]) {
            console.log("Create the table: " + tableId + "in dataset: " + datasetId);
            await createTable(datasetId, tableId);
        }
    } catch (error) {
        console.log(error);
    }
}

// Checks if a dataset exists in the bigquery.
// Params:
// - dataset_id: ID of the dataset. 
async function checkIfDatasetExist(dataset_id) {
    try {
        const bigquery = new BigQuery();

        const dataset = await bigquery.dataset(dataset_id).exists();

        return dataset;
    } catch (error) {
        console.log(error);
    }
}

// Checks if a table exists in the given dataset in bigquery.
// Params:
// - dataset_id: ID of the dataset. 
// - table_id: ID of the table. 
async function checkIfTableExist(datasetId, tableId) {
    try {
        if (checkIfDatasetExist(datasetId)) {
            const bigquery = new BigQuery();

            const table = await bigquery.dataset(datasetId).table(tableId).exists();

            return table;
        } else {
            console.log("Dataset " + datasetId + " doesn't exist.");
            return false;
        }
    } catch (error) {
        console.log(error);
    }
}

// Creates the dataset with the given ID
// Params:
//  - datasetId: ID of the dataset.
async function createDataset(datasetId) {
    try {
        const bigquery = new BigQuery();

        // Specify the geographic location where the dataset should reside
        const options = {
            location: 'US',
        };

        // Create a new dataset
        const [dataset] = await bigquery.createDataset(datasetId, options);
        console.log(`Dataset ${dataset.id} created.`);
    } catch (error) {
        console.log(error);
    }
}

// Creates the table holding event log objects.
// Params:
//  - datasetId: ID of the dataset.
//  - tableId: ID of the table to be created.
async function createTable(datasetId, tableId) {
    try {
        const bigquery = new BigQuery();

        const schema = [{ "name": "type", "type": "string", "mode": "Required" },
        { "name": "app_id", "type": "string", "mode": "Required" },
        { "name": "session_id", "type": "string", "mode": "Required" },
        { "name": "event_name", "type": "string", "mode": "Required" },
        { "name": "event_time", "type": "integer", "mode": "Required" },
        { "name": "page", "type": "string", "mode": "Required" },
        { "name": "country", "type": "string", "mode": "Required" },
        { "name": "region", "type": "string", "mode": "Required" },
        { "name": "city", "type": "string", "mode": "Required" },
        { "name": "user_id", "type": "string", "mode": "Required" }];

        const options = {
            schema: schema,
            location: 'US',
        };

        // Create a new table in the dataset
        const [table] = await bigquery
            .dataset(datasetId)
            .createTable(tableId, options);

        console.log(`Table ${table.id} created.`);
    } catch (error) {
        console.log(error);
    }
}

main();