# La Radio di Biagi - server

This project contains the server side of the LRdB project. If you haven't, you should first visit the [client repository](https://github.com/lunakv/lrdb-client) and its corresponding [Wiki](https://github.com/lunakv/lrdb-client/wiki) to find out more about the project and its goals.

**Language warning** 🇨🇿: Since the primary users of this project were czech, user documentation, log messages and page contents are in Czech.

## Requirements
- `node.js` runtime and `npm` 
- `pm2`
- Redis server
- MySQL compatible database
- Firebase project key

## Installation
1. Pull all project requirements
```bash
npm install
```
2. Replicate database schema
```bash
mysql -u *mysql_user* -p *database_name* < db_dump.sql
```

## Usage

See the [pm2 documentation](https://pm2.keymetrics.io) - `ecosystem.config.js` is the ecosystem file.

## Configuration
The server configuration is stored in three files:
- `ecosystem.config.js` is used to set up environment variables for the runtime and contains the path to the Firebase account credentials.
- `src/config.js` contains the Redis server configuration.
- `src/routes/fmf/config.js` is the main config file of the application. It contains the database configuration, username-password combinations and firebase settings, as well as the client-verifying magic string.

## Execution flow
### New message sending
1. Sender logs in to the admin panel (appropriate session is created).
2. Sender fills in the new message form and sends it to the server.
3. Server verifies the validity of the message data. If valid, the data is placed in a query and added to the 'Message' table (`newMsgQuery`).
4. Server periodically checks the database for new messages (`pollDB()`). If an unsent message is found that is due, its contents are passed to the Firebase API, which sends it to the registered users.
5. Once the API confirms it received the message, it is added to the 'Sent' table.

### Confirming received messages
1. Client sends a POST request to the server containing the verifying magic string, their unique client token and the ID of the received message. 
2. If both the magic and the ID are valid, the confirmation is added to the 'Viewed' table.


### Feedback
Bugs and feedback reports are saved into `./bugs` and `./feedback` respectively.
