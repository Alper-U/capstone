import { Database, OPEN_READWRITE } from 'sqlite3';
import { ConflictError, ForbiddenError, InternalServerError, UnauthorizedError } from './error';
import { decodeToken, verifyToken } from './utils';
import { checkEmailExists, checkUserExists, getEmail, isUserLoggedIn } from './db-utils';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
    // debug: clear db here
      // db.run("DELETE FROM user");
      if (err) return console.error(err.message);
});
export function getIdFromEmail(email:string) {
  return new Promise(async (resolve, reject) => {
    if (!await checkEmailExists(email)) return reject(new ConflictError("Invalid email"));
    return db.get(`SELECT * FROM user WHERE u_email like '${email}'`, (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        const response = {
          u_id: row.u_id
        }
        console.log("id retrieved");
        return resolve(response);
      }

    })
  })
}
export function getUserDetails(token: string, u_id: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new ConflictError("User is not logged in"));
    return db.get(`SELECT * 
                  FROM user WHERE u_id = ${u_id}`, (err, row) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else if (!row) {
        return reject(new ConflictError("No user of this ID found"));
      }
      else {
        const response = {
          id: row.u_id,
          fname: row.u_fname,
          lname: row.u_lname,
          email: row.u_email
        }
        console.log("Retrieved user details");
        return resolve(response);
      }
    })
  })
}

export function getUserProjects(token: string, uid: number) {
  return new Promise(async (resolve, reject) => {
    if (!await checkUserExists(uid)) return reject(new ConflictError("Invalid user ID"));
    if (!verifyToken(token, uid)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new ConflictError("User is not logged in"));
    return db.all(`SELECT DISTINCT * FROM projects 
                  JOIN user_projects ON user_projects.p_id = projects.p_id
                  JOIN user ON user_projects.u_id = user.u_id
                  WHERE user.u_id = ${uid};`, (err, rows) => {
      if (err) {
        console.log("Cannot get projects");
        return reject(new InternalServerError());
      }
      else {
        let projects: any[] = [];
        let list = {projects};
        rows.forEach((row) => {
          let response = {
            p_id: row.p_id,
            p_name: row.p_name,
            creator_id: row.p_owner,
            p_description: row.p_desc,
            creation_date: row.creation_date
          }
          list.projects.push(response);
        })
        console.log(`Found projects belonging to uid ${uid}`);
        return resolve(list);
      }
    });
  })
}
export function updateUserDetails(token: string, u_id: number, fname: string, lname: string, email:string) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, u_id)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await checkUserExists(u_id)) return reject(new ConflictError("Invalid user ID"));
    if (await checkEmailExists(email) && email != await getEmail(u_id)) return reject(new ConflictError("Email already in use"));
    return db.run(`UPDATE user 
                  SET u_fname = '${fname}',
                  u_lname = '${lname}',
                  u_email = '${email}'
                  WHERE u_id = ${u_id}`, (err) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        console.log("Updated user details");
        return resolve("");
      }

    })
  })
}
