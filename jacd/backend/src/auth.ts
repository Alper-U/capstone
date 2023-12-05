import bcrypt from "bcrypt";
import { Database, OPEN_READWRITE } from 'sqlite3';
import { checkEmailExists, checkUserExists, getPassword, getUserId, isUserLoggedIn } from './db-utils'
import { ConflictError, InternalServerError, UnauthorizedError } from "./error";
export const jwt_secret = "this is a secret secret";
import {
  decodeToken,
  generateHash,
  generateToken,
  validEmail,
  verifyToken
} from "./utils"


export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
  // debug: clear db here
  // db.run("DELETE FROM user");
  if (err) return console.error(err.message);
});

export function validRegistration(fname: string, lname: string, email: string, password: string) {
  return new Promise(async (resolve, reject) => {

    if (!validEmail(email)) return reject(new ConflictError("Invalid email"))
    if (await checkEmailExists(email)) return reject(new ConflictError("Email is already in use"));
    const query = `INSERT INTO user (u_fname, u_lname, u_email, u_password) VALUES(?,?,?,?)`;
    return db.run(query, [fname, lname, email, generateHash(password)], err => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("Registration validated");
      }
    });
  })
}

async function checkPassword(email: string, password: string) {
  return new Promise(async (resolve, reject) => {
    if (!await checkEmailExists(email)) return reject(new ConflictError("Email or password invalid"));
    return await getPassword(email)
      .then(function (ret) {
        if (bcrypt.compareSync(password, ret)) {
          return resolve(true);
        }
        else return reject(new ConflictError("Email or password invalid"));
      })
      .catch(function () {
        return reject(false);
      });
  })
}

export async function login(email: string, password: string): Promise<object> {
  return new Promise(async (resolve, reject) => {
    return await checkPassword(email, password)
      .then(async function (ret) {
        if (ret) {
          console.log("Password check success");
          const u_id = await getUserId(email);
          const token = generateToken(u_id);
          const response = {
            u_id,
            token
          }
          addToActiveSessions(token);
          return resolve(response);
        }
      })
      .catch(function (err) {
        console.log("Password check failed");
        return reject(err);
      })
  })
}

export async function logout(token: string, uid: number): Promise<object> {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new ConflictError("Token could not be validated"));

    console.log(`logging out user ${uid}`);
    return resolve(removeFromActiveSessions(token));
  });
}

export async function register(fname: string, lname: string, email: string, password: string): Promise<object> {
  return new Promise(async (resolve, reject) => {
    return await validRegistration(fname, lname, email, password)
      .then(async function (ret) {
        console.log(ret)
        const u_id = await getUserId(email);
        const token = generateToken(u_id);
        const response = {
          u_id,
          token
        }
        addToActiveSessions(token);
        return resolve(response);
      })
      .catch(function (err) {
        console.log(err);
        return reject(err);
      });
  })

}
export function changePassword(email: string, password: string) {
  return new Promise(async (resolve, reject) => {
    if (!await checkEmailExists(email)) return; // pass silently - security
    return db.run(`UPDATE user SET u_password = '${generateHash(password)}' WHERE u_email like '${email}'`, err => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("Success");
      }
    });
  })
}

export function addToActiveSessions(token: string) {
  return new Promise(async (resolve, reject) => {
    const query = `INSERT INTO active_sessions (token) VALUES(?)`;
    return db.run(query, [token], async err => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("Success");
      }
    })
  })
}

export function removeFromActiveSessions(token: string) {
  return new Promise(async (resolve, reject) => {
    return db.get(`DELETE FROM active_sessions WHERE token LIKE '${token}'`, async (err, row) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else if (row) {
        return resolve("");
      }
      else {
        return resolve('Logged out');
      }
    })
  })
}