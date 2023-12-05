import { Database, OPEN_READWRITE } from 'sqlite3';
import { checkProjectExists, checkRequestAlreadySent, checkUserExists, isFriend, isUserInProject, isUserLoggedIn, requestExists } from './db-utils';
import { ConflictError, InternalServerError, UnauthorizedError } from './error';
import { verifyToken } from './utils';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
    // debug: clear db here
      // db.run("DELETE FROM user");
      // db.run("DELETE FROM projects");
      if (err) return console.error(err.message);
});

export function sendRequest(token: string, senderId: number, receiverId: number, requestType: string, projectId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, senderId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(senderId)) return reject(new ConflictError("Invalid user ID"));
    if (!await checkUserExists(receiverId)) return reject(new ConflictError("Invalid user ID"));
    if (await checkRequestAlreadySent(senderId, receiverId, requestType, projectId)) return reject(new ConflictError("Request already sent"));
    if (requestType == "friend") {
      if (await isFriend(senderId, receiverId)) return reject(new ConflictError("User is already a friend"));
    }
    if (requestType == "project") {
      if (!await checkProjectExists(projectId)) return reject(new ConflictError("Project does not exist"));
      if (!await isUserInProject(senderId, projectId)) return reject(new ConflictError("User does not belong to this project"));
      if (await isUserInProject(receiverId, projectId)) return reject(new ConflictError("User already belongs to this project"))
    }
    const query = `INSERT INTO requests (sender_id, receiver_id, r_type, p_id) VALUES(?,?,?,?)`;
    return db.run(query, [senderId, receiverId, requestType, projectId], async err => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        const r_id = await getLastInsertedId();
        return resolve(r_id);
      }
    })
  })
}

export function removeRequest(token: string, userId: number, requestId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!await requestExists(requestId)) return reject(new ConflictError("Invalid request id"));
    
    const query = `DELETE FROM requests WHERE r_id = '${requestId}'`;
    return db.run(query, async err => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    })
  })
}
export function getIncomingRequests(token: string, userId: number) {
  return new Promise(async (resolve, reject) => {
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));

    return db.all(`
    SELECT * FROM requests
    WHERE receiver_id = ${userId}
    `, async (err, rows) => {
    if (err) {
      return reject(new InternalServerError());
    }
    else {
      let requests: any[] = [];
      let list = {requests};
      rows.forEach((row) => {
        const response = {
          r_id: row.r_id,
          sender_id: row.sender_id,
          r_type: row.r_type,
          p_id: row.p_id,
          creation_date: row.creation_date
        }
        list.requests.push(response);
      })
    return resolve(list);
    }
    });
  })
}
export function getOutgoingRequests(token: string, userId: number) {
  return new Promise(async (resolve, reject) => {
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));

    return db.all(`
    SELECT * FROM requests
    WHERE sender_id = ${userId}
    `, async (err, rows) => {
    if (err) {
      return reject(new InternalServerError());
    }
    else {
      let requests: any[] = [];
      let list = {requests};
      rows.forEach((row) => {
        const response = {
          r_id: row.r_id,
          receiver_id: row.receiver_id,
          r_type: row.r_type,
          r_desc: row.r_desc,
          creation_date: row.creation_date
        }
        list.requests.push(response);
      })
    return resolve(list);
    }
    });
  })
}
export function getLastInsertedId(): Promise<number> {
    return new Promise((resolve, reject) => {      
      return db.get(`SELECT last_insert_rowid() as id`, (err, row) => {
        if (err) {
          return reject(-1);
        }
        else {
          console.log(row.id);
          return resolve(row.id);
        }
      });
    });
  }