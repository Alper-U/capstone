import { Database, OPEN_READWRITE } from 'sqlite3';
import { checkProjectExists, checkUserExists, isUserLoggedIn } from './db-utils';
import { ConflictError, InternalServerError, UnauthorizedError } from './error';
import { verifyToken } from './utils';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
    // debug: clear db here
      // db.run("DELETE FROM user");
      // db.run("DELETE FROM projects");
      if (err) return console.error(err.message);
});

export function sendMessage(token: string, sender: number, receiver: number, message: string) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, sender)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(sender)) return reject(new ConflictError("Invalid user ID"));
    if (!await checkUserExists(receiver)) return reject(new ConflictError("Invalid user ID"));
    const query = `INSERT INTO messages (u_senderId, u_receiverId, message) VALUES(?,?,?)`;
    return db.run(query, [sender, receiver, message], async err => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        const m_id = await getLastInsertedId();
        return resolve(m_id);
      }
    })
  })
}

export function editMessage(token: string, sender: number, message: string, messageId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, sender)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(sender)) return reject(new ConflictError("Invalid user ID"));
    return db.run(`UPDATE messages SET message = '${message}' WHERE m_id = ${messageId}`, async err => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    })
  })
}

export function deleteMessage(token: string, sender: number, messageId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, sender)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(sender)) return reject(new ConflictError("Invalid user ID"));
    return db.run(`DELETE FROM messages WHERE m_id = ${messageId}`, async err => {
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

export function getMessages(token: string, sender: number, receiver: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, sender)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(sender)) return reject(new ConflictError("Invalid user ID"));
    return db.all(`SELECT DISTINCT * FROM messages 
                  JOIN user on user.u_id = messages.u_senderId
                  WHERE (messages.u_senderId = ${sender} AND messages.u_receiverId = ${receiver})
                  OR
                  (messages.u_senderId = ${receiver} AND messages.u_receiverId = ${sender})
                  ORDER BY creation_date`, async (err, rows) => {
        if (err) {
          return reject(new InternalServerError());
        }
        else {
          let messages: any[] = [];
          let list = {messages};
          rows.forEach((row) => {
            const response = {
              sender_id: row.u_senderId,
              receiver_id: row.u_receiverId,
              m_id: row.m_id,
              message: row.message,
              creation_date: row.creation_date
            }
            list.messages.push(response);
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