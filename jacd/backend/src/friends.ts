import { Database, OPEN_READWRITE } from 'sqlite3';
import { checkProjectExists, checkUserExists, isFriend, isUserLoggedIn } from './db-utils';
import { ConflictError, InternalServerError, UnauthorizedError } from './error';
import { verifyToken } from './utils';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
    // debug: clear db here
      // db.run("DELETE FROM user");
      // db.run("DELETE FROM projects");
      if (err) return console.error(err.message);
});

export function addFriend(token: string, userId: number, friendId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!await checkUserExists(friendId)) return reject(new ConflictError("Invalid user ID"));
    if (await isFriend(userId, friendId)) return reject(new ConflictError("User is already a friend"));
    
    const query = `INSERT INTO friends (u_id1, u_id2) VALUES(?,?)`;
    return db.run(query, [userId, friendId], async err => {
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
export function removeFriend(token: string, userId: number, friendId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!await checkUserExists(friendId)) return reject(new ConflictError("Invalid user ID"));
    if (!await isFriend(userId, friendId)) return reject(new ConflictError("User is not a friend"));
    
    const query = `DELETE FROM friends WHERE (u_id1 = ${userId} AND u_id2 = ${friendId}) OR (u_id1 = ${friendId} AND u_id2 = ${userId})`;
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
export function getFriends(token: string, userId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));

    return db.all(`
    SELECT DISTINCT u_id2 as friend_id, add_date FROM friends 
    WHERE u_id1 = ${userId}
    UNION ALL
    SELECT DISTINCT u_id1 as friend_id, add_date FROM friends 
    WHERE u_id2 = ${userId}
    ORDER BY add_date DESC
`, async (err, rows) => {
    if (err) {
      return reject(new InternalServerError());
    }
    else {
      let friends: any[] = [];
      let list = {friends};
      rows.forEach((row) => {
        const response = {
          friend_id: row.friend_id,
          add_date: row.add_date
        }
        list.friends.push(response);
      })
    return resolve(list);
    }
    });
  })
}
