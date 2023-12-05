# Backend

## To install dependencies
Just run this every time on a new pull. Dependencies may get added

```
yarn install
```

## Start backend on port 5005

```
yarn start
```

## Bot deployment
Firstly add the config file using 
```
gpg -d config.json.gpg
```
Then enter the password. If a new command file is added, deploy it to the server and run the bot:

```
cd jacd/backend/discord-bot
node deploy-commands.js
node jacd-bot.js
```

## API doc

## HTTP endpoint docs

Available [here](http://localhost:5005/docs)

## API
* GET /projects/{ProjectId}/users
* Gets all users of a project
* Request:
* {}
* Response:
* {
*   u_id: row.u_id,
*   p_id: row.p_id,
*   u_fname: row.f_fname,
*   u_lname: row.f_lname,
*   u_email: row.u_email,
* }

* POST /projects/{ProjectId}/{UserId}
* Assigns a user to a project
* Request:
* {}
* Response:
* {}

* DELETE /projects/{ProjectId}/{UserId}
* Removes a user from a project
* Request:
* {}
* Response:
* {}

* DELETE /projects/{ProjectId}/leave
* Removes client from a project
* Request:
* {}
* Response:
* {}

* PUT /projects/{ProjectId}/{UserId}/promote
* Promotes a user of a project to admin
* Request:
* {}
* Response:
* {}

* PUT /projects/{ProjectId}/{UserId}/demote
* Demotes a user from admin
* Request:
* {}
* Response:
* {}

* PUT /tasks/{TaskId}/{UserId}
* assign user to task
* Request:
* {}
* Response:
* {}

## MESSAGING API
* POST /message/{UserId}
* Posts a message to UserId
* Request:
* {
*    message: "hello"
* }
* Response:
* {
*    m_id: 1
* }

* GET /message/{UserId}
* Gets all messages associated with the other user
* Request:
* {}
* Response:
* {
*   messages: [
        {
            sender_id: 1,
            receiver_id 2,
            m_id: 1,
            message: "hi",
            creation_date: "2023-02-21 17:32:28"
        },
        {
            sender_id: 2,
            receiver_id: 1,
            m_id: 2,
            message: "bye",
            creation_date: "2023-02-21 18:32:28"
        }
*   ]    
* }

* PUT /message/edit/{MessageId}
* Edits a message
* Request:
* {
*    message: "bye"
* }
* Response:
* {}

* DELETE /message/edit/{MessageId}
* Deletes message
* Request:
* {}
* Response:
* {}

