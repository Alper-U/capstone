
import { Database, OPEN_READWRITE } from 'sqlite3';
import { verifyToken, decodeToken } from './utils';
import { checkProjectExists, checkTaskExists, checkUserExists, isUserLoggedIn } from './db-utils';
import { ConflictError, InternalServerError, InvalidInputError, UnauthorizedError } from './error';

export const db = new Database("./database.db", OPEN_READWRITE, (err) => {
  // debug: clear db here
  // db.run("DELETE FROM user");
  if (err) return console.error(err.message);
});

export function createTask(token: string, pid: number, tname: string, creator: number, assignee: number | null, desc: string, deadline: string | null, status: string | null) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, creator)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (tname == null) return reject(new InvalidInputError("Could not create task: task name cannot be empty"));
    if (!await checkProjectExists(pid)) {
      console.log("Could not create task: no such project")
      return reject(new ConflictError("Could not create task: no such project"));
    }
    if (!await checkUserExists(creator)) {
      console.log("This user does not exist")
      return reject(new ConflictError("Could not create task: no such user"));
    }
    if (assignee != null && !await checkUserExists(assignee)) {
      console.log("Assignee does not exist")
      return reject(new ConflictError("Could not create task: no such assignee"));
    }
    
    const query = `INSERT INTO tasks (p_id, t_creator_id, t_assignee, t_name, t_desc, t_deadline, t_status) VALUES(?,?,?,?,?,?,?);`
    return db.run(query, [pid, creator, assignee, tname, desc, deadline, status], async err => {
      if (err) {
        console.log(err)
        return reject(new InternalServerError());
      }
      else {
        console.log("inserted")
        return resolve(await getLastInsertedId());
      }
    });
  })
}

export function getTask(id: number) {
  return new Promise(async (resolve, reject) => {
    if (!await checkTaskExists(id)) return (new ConflictError("No such task found"));
    return db.get(`SELECT * FROM tasks WHERE t_id = ${id}`, (err, row) => {
      if (err) {
        return reject(new InternalServerError());
      }
      else{
        const response = {
          t_id: row.t_id,
          p_id: row.p_id,
          t_name: row.t_name,
          t_description: row.t_desc,
          assignee_id: row.t_assignee,
          creator_id: row.t_creator_id,
          creation_date: row.t_creation_date,
          deadline: row.t_deadline,
          task_status: row.t_status
        }
        resolve(response);
      }
    });
  });
}
export function getAllTasks(token: string, uid: number) {
  
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, uid)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(uid)) return reject(new ConflictError("Invalid user ID"));
    return db.all(`SELECT DISTINCT * FROM tasks 
                  JOIN projects ON tasks.p_id = projects.p_id
                  JOIN user_projects ON projects.p_id = user_projects.p_id
                  WHERE user_projects.u_id = ${uid}`, (err, rows) => {
      if (err) {
        console.log("Cannot get tasks");
        return reject(new InternalServerError());
      }
      else {
        let tasks: any[] = [];
        let list = {tasks};
        rows.forEach((row) => {
          const response = {
            t_id: row.t_id,
            p_id: row.p_id,
            t_name: row.t_name,
            t_description: row.t_desc,
            assignee_id: row.t_assignee,
            creator_id: row.t_creator_id,
            creation_date: row.t_creation_date,
            deadline: row.t_deadline,
            task_status: row.t_status
          }
          list.tasks.push(response);
        })
        console.log("found tasks");
        return resolve(list);
      }
    });
  })
}

export function updateTaskDetails(token: string, tid: number, name: string, desc: string, assignee: number | null, status: string, deadline: string) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkTaskExists(tid)) return new ConflictError("Could not update task: this task does not exist");
    if (assignee != null && !await checkUserExists(assignee)) {
      console.log("Assignee does not exist")
      return reject(new ConflictError("Could not update task: no such assignee"));
    }
    if (name == null) {
      return reject(new ConflictError("Could not update task: name cannot be empty"));
    }
    //TODO: error check for dates before today
    return db.run(`UPDATE tasks SET t_name = '${name}', t_desc = '${desc}', t_assignee = '${assignee}', t_status = '${status}', t_deadline = '${deadline}'
                  WHERE t_id = ${tid}`, async (err) => {
        if (err) {
          console.log(err);
          return reject(new InternalServerError());
        }
        else {
          const response = ""
          return resolve(response);
        }
      });
  })
}

export function getUserTasks(token: string, uid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkUserExists(uid)) return new ConflictError("User does not exist");
    return db.all(`SELECT * FROM tasks WHERE t_assignee = ${uid}`, (err, rows) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        let tasks: any[] = [];
        let list = {tasks};
        rows.forEach((row) => {
          const response = {
            t_id: row.t_id,
            p_id: row.p_id,
            t_name: row.t_name,
            t_description: row.t_desc,
            assignee_id: row.t_assignee,
            creator_id: row.t_creator_id,
            creation_date: row.t_creation_date,
            deadline: row.t_deadline,
            task_status: row.t_status
          }
          list.tasks.push(response);
        })
        console.log("found tasks");
        return resolve(list);
      }
    });
  })
}
export function getProjectTasks(token: string, pid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkProjectExists(pid)) return new ConflictError("Project does not exist");
    return db.all(`SELECT * FROM tasks WHERE p_id = ${pid}`, (err, rows) => {
      if (err) {
        console.log("Cannot get tasks");
        return reject(new InternalServerError());
      }
      else {
        let tasks: any[] = [];
        let list = {tasks};
        rows.forEach((row) => {
          const response = {
            t_id: row.t_id,
            p_id: row.p_id,
            t_name: row.t_name,
            t_description: row.t_desc,
            assignee_id: row.t_assignee,
            creator_id: row.t_creator_id,
            creation_date: row.t_creation_date,
            deadline: row.t_deadline,
            task_status: row.t_status
          }
          list.tasks.push(response);
        })
        console.log("found tasks");
        return resolve(list);
      }
    });
  })
}
export function deleteTask(token: string, tid: number) {
  return new Promise(async (resolve, reject) => {
    if (!decodeToken(token)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await isUserLoggedIn(token)) return reject(new UnauthorizedError("Your session has expired"));
    if (!await checkTaskExists(tid)) return new ConflictError("Could not delete task: this task does not exist");
    return db.run(`DELETE FROM tasks WHERE t_id = ${tid}`, async (err) => {
        if (err) {
          return reject(new InternalServerError());
        }

        else {
          return resolve("");
        }
      });
  })
}
export function getLastInsertedId() {
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
export function getBusyValue(token:string, userId: number, otherId: number) {
  return new Promise(async (resolve, reject) => {
    if (!verifyToken(token, userId)) return reject(new UnauthorizedError("Token could not be validated"));
    if (!await checkUserExists(userId)) return reject(new ConflictError("Invalid user ID"));
    if (!await checkUserExists(otherId)) return reject(new ConflictError("Invalid user ID"));
    
    return db.all(`SELECT * FROM tasks WHERE t_assignee = ${otherId} and t_deadline BETWEEN DATE('now') AND DATE('now','+7 day') and t_status NOT LIKE 'done'`, (err, rows) => {
      if (err) {
        console.log(err);
        return reject(new InternalServerError());
      }
      else {
        return resolve(rows.length*20);
      }
    });
  })
}