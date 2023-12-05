import { Database, OPEN_READWRITE } from 'sqlite3';
import { ConflictError, InternalServerError } from './error';
import { removeFromActiveSessions } from './auth';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
    // debug: clear db here
      // db.run("DELETE FROM user");
      if (err) return console.error(err.message);
});

export function getPassword(email: string): Promise<string>{
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT u_password FROM user WHERE u_email LIKE '${email}'`, (err, row) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else if (!row) {
        return reject(new ConflictError("The email entered does not exist"));
      }
      else resolve(row.u_password);
    });
  });
}

export function getUserId(email: string): Promise<number>{
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT u_id FROM user WHERE u_email LIKE '${email}'`, (err, row) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else if (!row) {
        return reject(new ConflictError("Could not find this user"));
      }
      else resolve(row.u_id);
    });
  });
}

export function deleteUser(token: string, u_id: number) {
  return new Promise((resolve, reject) => {
    return db.run(`DELETE FROM user WHERE u_id = ${u_id}`, (err) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      else {
        console.log("Deleted user");
        removeFromActiveSessions(token);
        return resolve("");
      }

    })
  })
}
export function getProjectId(name: string) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT p_id FROM projects WHERE p_name LIKE '${name}'`, (err, row) => {
      if (err) {
        return reject("Could not get id");
      }
      else if (!row) {
        return reject("No such project name");
      }
      else resolve(row.p_id);
    });
  });
}
export function checkProjectExists(id: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM projects WHERE p_id = ${id}`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (!row) {
        return resolve(false);
      }
      else return resolve(true);
    });
  });
}
export function checkTaskExists(id: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM tasks WHERE t_id = ${id}`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (!row) {
        return resolve(false);
      }
      else return resolve(true);
    });
  });
}
export function checkUserExists(id: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM user WHERE u_id = ${id}`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (!row) {
        return resolve(false);
      }
      else resolve(true);
    });
  });
}
export function checkUserIsAdmin(uid: number, pid: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM user_projects WHERE u_id = ${uid} AND p_id = ${pid} AND admin = 1`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (!row) {
        return resolve(false);
      }
      else resolve(true);
    });
  });
}
export function checkEmailExists(email: string) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM user WHERE u_email like '${email}'`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) return resolve(true);
      else return resolve(false);
    });
  });
}
export function isUserInProject(uid: number, pid: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM user_projects WHERE u_id = ${uid} AND p_id = ${pid}`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {

        return resolve(true);
      }
      else return resolve(false);
    });
  });
}
export function getEmail(uid: number): Promise<String> {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT u_email FROM user WHERE u_id = ${uid}`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        console.log(row.u_email)
        return resolve(row.u_email);
      }
      else return reject("");
    });
  });
}
export function isFriend(userId: number, friendId: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM friends WHERE (u_id1 = ${userId} AND u_id2 = ${friendId}) or (u_id1 = ${friendId} AND u_id2 = ${userId})`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        return resolve(true);
      }
      else return resolve(false);
    });
  });
}
export function requestExists(requestId: number) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM requests WHERE r_id = '${requestId}'`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        return resolve(true);
      }
      else return resolve(false);
    });
  });
}

export function isUserLoggedIn(token: string) {
  return new Promise((resolve, reject) => {          // return new Promise here <---
    return db.get(`SELECT * FROM active_sessions WHERE token LIKE '${token}'`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        return resolve(true);
      }
      else return resolve(false);
    });
  });
}
export function checkRequestAlreadySent(senderId: number, receiverId: number, requestType: string, projectId: number | null) {
  
  return new Promise((resolve, reject) => {          // return new Promise here <---
    let query = ""
    if (requestType == "project") query = `SELECT * FROM requests WHERE sender_id = ${senderId} 
                                          AND receiver_id = ${receiverId} 
                                          AND r_type = '${requestType}' 
                                          AND p_id = ${projectId}`
    else if (requestType == "friend") query = `SELECT * FROM requests WHERE sender_id = ${senderId} 
                                          AND receiver_id = ${receiverId} 
                                          AND r_type = '${requestType}'`
    else return resolve(false);
    return db.get(query, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        return resolve(true);
      }
      else return resolve(false);
    });
  });
}