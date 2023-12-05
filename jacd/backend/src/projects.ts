import { Database, OPEN_READWRITE } from 'sqlite3';
import { checkProjectExists, checkUserExists, checkUserIsAdmin, getProjectId, isUserInProject, isUserLoggedIn } from './db-utils';
import { ConflictError, ForbiddenError, InternalServerError, UnauthorizedError } from './error';
import { decodeToken, verifyToken } from './utils';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
  // debug: clear db here
  // db.run("DELETE FROM user");
  // db.run("DELETE FROM projects");
  if (err) return console.error(err.message);
});
export function deleteProjects() {
  return new Promise((resolve, reject) => {

    return db.run(`DELETE FROM projects`, err => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    });
  })
}

export function createProject(token: string, u_id: number, pname: string, desc: string) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    const query = `INSERT INTO projects (p_owner, p_name, p_desc) VALUES(?,?,?)`;
    return db.run(query, [u_id, pname, desc], async err => {

      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        const newPid = await getLastInsertedId();
        setAdmin(token, u_id, newPid);
        console.log("created project");
        return resolve(newPid);
      }
    });
  })
}

function setAdmin(token: string, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {

    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    return db.run(`UPDATE user_projects SET admin = 1 WHERE u_id = ${uid} AND p_id = ${pid}`, async err => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        console.log("set to admin");
        return resolve("");
      }
    });
  })
}

function removeAdmin(token: string, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, uid)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    return db.run(`UPDATE user_projects SET admin = 0 WHERE u_id = ${uid} AND p_id = ${pid}`, async err => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        console.log("removed admin");
        return resolve("");
      }
    });
  })
}
export function updateProjectDetails(token: string, pid: number, name: string, desc: string) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Invalid project ID"));
    return db.run(`UPDATE projects SET p_name = '${name}', p_desc = '${desc}'
                  WHERE p_id = ${pid}`, async (err) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        const response = ""
        return resolve(response);
      }
    });
  })
}
export function getProject(token: string, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));
    return db.get(`SELECT * FROM projects WHERE p_id = ${pid}`, async (err, row) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        const response = {
          p_id: row.p_id,
          p_name: row.p_name,
          creator_id: row.p_owner,
          p_description: row.p_desc,
          creation_date: row.creation_date
        }
        return resolve(response);
      }
    });
  })
}
export function deleteProject(token: string, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));
    return db.run(`DELETE FROM projects WHERE p_id = ${pid}`, async (err) => {
      if (err) {
        return reject(new InternalServerError());
      }

      else {
        return resolve("");
      }
    });
  })
}
export function addUserToProject(token: string, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(uid)) return reject(new ConflictError("User does not exist"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));
    if (await isUserInProject(uid, pid)) return reject(new ConflictError("User is already part of this project"));

    const query = `INSERT INTO user_projects (p_id, u_id) VALUES(?,?)`;


    return db.run(query, [pid, uid], (err) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    });
  })
}
export function removeUserFromProject(token: string, issuerId: number, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, issuerId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(issuerId)) return reject(new ConflictError("Invalid user ID"));
    if (!await isUserInProject(uid, pid)) return reject(new ConflictError("User does not exist"));
    if (!await checkUserIsAdmin(issuerId, pid)) return reject(new ForbiddenError("Insufficient privileges"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));

    return db.run(`DELETE FROM user_projects WHERE u_id = ${uid} AND p_id = ${pid}`, (err) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    });
  })
}
export function promoteUser(token: string, issuerId: number, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, issuerId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(issuerId)) return reject(new ConflictError("Invalid user ID"));
    if (!await isUserInProject(uid, pid)) return reject(new ConflictError("User does not exist"));
    if (!await checkUserIsAdmin(issuerId, pid)) return reject(new ForbiddenError("Insufficient privileges"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));

    await setAdmin(token, uid, pid).then(function () { return resolve("") }).catch(function (err) { return reject(err) });
  })
}
export function demoteUser(token: string, issuerId: number, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, issuerId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(issuerId)) return reject(new ConflictError("Invalid user ID"));
    if (!await isUserInProject(uid, pid)) return reject(new ConflictError("User does not exist"));
    if (!await checkUserIsAdmin(issuerId, pid)) return reject(new ForbiddenError("Insufficient privileges"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("Project does not exist"));

    await removeAdmin(token, uid, pid).then(function () { return resolve("") }).catch(function (err) { return reject(err) });
  })
}
export function getUsersOfProject(token: string, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkProjectExists(pid)) return reject(new ConflictError("User does not exist"));
    return db.all(`SELECT DISTINCT * FROM projects 
                  JOIN user_projects on user_projects.p_id = projects.p_id
                  JOIN user on user.u_id = user_projects.u_id
                  WHERE projects.p_id = ${pid}`, async (err, rows) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        let users: any[] = [];
        let list = { users };
        rows.forEach((row) => {
          const response = {
            u_id: row.u_id,
            p_id: row.p_id,
            u_fname: row.u_fname,
            u_lname: row.u_lname,
            u_email: row.u_email,
            admin: row.admin
          }
          list.users.push(response);
        })
        return resolve(list);
      }
    });
  })
}
export function leaveProject(token: string, uid: number, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, uid)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(uid)) return reject(new ConflictError("Invalid user ID"));

    if (!await checkProjectExists(pid)) return reject(new ConflictError("User does not exist"));
    return db.run(`DELETE FROM user_projects WHERE u_id = ${uid} AND p_id = ${pid}`, (err) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else {
        return resolve("");
      }
    })
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