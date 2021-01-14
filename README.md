# Codeway Backend Case Challenge
I am asked to create an infrastructure on Google Cloud which collects user’s event logs and stores in BigQuery and also serves the aggregated data stored.

Two services are implemented to maintain the infrastructure. Event Logs Service is to add event logs to and retrieve from the Big Query. Stats Service is to return some statistical data about the event logs, such as daily users.
Both services are currently running in separate machines in Google Cloud using Cloud Run. For applying the microservice architecture, I could have also chosen using NGINX or HEROKU, but I wanted to try Cloud Run in Google Cloud.

# Endpoints

## Event Logs Service

### Writing Logs to BigQuery

Writes the event logs given in the body to the event logs BigQuery table using. 

**Endpoint:** `/write-logs` \
**Method:** `POST` \
**Parameters:** Event logs sent in body in JSON format. 

### Getting All Logs From BigQuery

Gets all of the event logs stored in BigQuery table. 

**Endpoint:** `/get-logs` \
**Method:** `POST` \
**Parameters:** _None_

## Stats Service

### Daily Active Users

Returns a list of _date: active user count_ key value pair.

**Endpoint:** `/daily-active-users` \
**Method:** `GET` \
**Parameters:** _None_

### Daily Average Time Spent by Each User

Returns a list of _user_id: seconds_ key value pair, where seconds is the average value of how much time that user spent.

**Endpoint:** `/daily-avg-durations` \
**Method:** `GET` \
**Parameters:** _None_

### Daily Active Users

Returns all user ids, and total number of users.

**Endpoint:** `/total-users` \
**Method:** `GET` \
**Parameters:** _None_
