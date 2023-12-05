import express, { Application, Request, response, Response } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import cors from 'cors'
import {
  login,
  register,
  changePassword,
  logout
} from "./auth"

import {
  decodeToken,
} from "./utils"
import { deleteUser } from "./db-utils"
import { getIdFromEmail, getUserDetails, getUserProjects, updateUserDetails } from "./users";
import { addUserToProject, createProject, deleteProject, deleteProjects, demoteUser, getProject, getUsersOfProject, leaveProject, promoteUser, removeUserFromProject, updateProjectDetails } from "./projects";
import { createTask, deleteTask, getAllTasks, getBusyValue, getProjectTasks, getTask, getUserTasks, updateTaskDetails } from "./tasks";
import { deleteMessage, editMessage, getMessages, sendMessage } from "./messages";
import { addFriend, getFriends, removeFriend } from "./friends";
import { getIncomingRequests, removeRequest, sendRequest } from "./connections";

const app: Application = express();

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get(`/`, (req, res) => {
  res.redirect(`/docs`);
})
// Debug:
app.delete(`/delete/projects`, async (req, res) => {
  deleteProjects();
  return res.status(200)
    .json({});
})

/////////////////////////////////////// routes
app.post(`/auth/login`, (req, res) => {
  const { email, password } = req.body;
  login(email, password)
    .then(function (response) {
      return res
        .status(200)
        .json(response);
    })
    .catch(function (error) {
      const response = {
        "error": error.errorMessage
      };
      return res
        .status(error.statusCode)
        .json(response);
    })
});

app.post(`/auth/logout`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  logout(authorization, jwtData.uid)
  .then(function (response) {
    return res
      .status(200)
      .json(response);
  })
  .catch(function (error) {
    const response = {
      "error": error.errorMessage
    };
    return res
      .status(error.statusCode)
      .json(response)
  })
});

app.post(`/auth/register`, (req, res) => {
  const { fname, lname, email, password } = req.body;

  // DEBUG: remove after DB setup - logging password bad
  // console.log(`User registered...\nName: ${fname} ${lname}\nEmail: ${email}\nPassword: ${password}`)
  register(fname, lname, email, password)
    .then(function (response) {
      return res
        // .cookie("token", generateToken(id))
        // .cookie("rememberMe", "true")
        .status(200)
        .json(response);
    })
    .catch(function (error) {
      const response = {
        "error": error.errorMessage
      };
      return res
        .status(error.statusCode)
        .json(response);
    })
});

app.put(`/auth/resetpassword`, (req: any, res) => {
  const { email, password } = req.body;
  changePassword(email, password)
    .then(function (response) {
      return res.status(200).json({ response });
    })
    .catch(function (error) {
      const response = {
        "error": error.errorMessage
      };
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.route(`/users/:id`)
  .get((req: any, res) => {
    const authorization = req.headers.authorization;
    getUserDetails(authorization, +req.params.id)
      .then(function (response) {
        console.log(response)
        return res
          .status(200)
          .json(response);
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .put((req: any, res) => {
    const authorization = req.headers.authorization;
    const { fname, lname, email } = req.body;
    updateUserDetails(authorization, +req.params.id, fname, lname, email)
      .then(function () {
        return res
          .status(200)
          .json({});
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .delete((req: any, res) => {
    const authorization = req.headers.authorization;
    deleteUser(authorization, +req.params.id)
      .then(function () {
        return res
          .status(200)
          .json({});
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })

app.get(`/projects`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getUserProjects(authorization, jwtData.uid)
    .then(function (response) {
      return res
        .status(200)
        .json(response);
    })
    .catch(function (error) {
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.post(`/projects/create`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const { u_id, p_name, p_description } = req.body;
  createProject(authorization, u_id, p_name, p_description)
    .then(function (projectId) {
      return res.status(200).json({ projectId });
    })
    .catch(function (error) {
      console.log(error.errorMessage);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.route(`/projects/:id`)
  .get((req: any, res) => {
    const authorization = req.headers.authorization;
    getProject(authorization, +req.params.id)
      .then(function (response) {
        return res
          .status(200)
          .json(response);
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .put((req: any, res) => {
    const authorization = req.headers.authorization;
    const { p_name, p_description } = req.body;
    updateProjectDetails(authorization, +req.params.id, p_name, p_description)
      .then(function () {
        console.log("Updated project");
        return res.status(200).json({});
      })
      .catch(function (error) {
        console.log(error);
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .delete((req: any, res) => {
    const authorization = req.headers.authorization;
    deleteProject(authorization, +req.params.id)
      .then(function () {
        console.log("deleted");
        return res.status(200).json({});
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
app.post(`/tasks/create/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const { t_name, t_description, assignee_id, creator_id, task_status, t_deadline } = req.body;
  createTask(authorization, +req.params.id, t_name, creator_id, assignee_id, t_description, t_deadline, task_status)
    .then(function (taskId) {
      console.log("created task");

      return res.status(200).json({ taskId });
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.get(`/tasks/user/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);

  getUserTasks(authorization, +req.params.id)
    .then(function (tasks) {
      console.log("Found tasks");

      return res.status(200).json(tasks);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.get(`/tasks`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);

  getAllTasks(authorization, jwtData.uid)
    .then(function (tasks) {
      console.log("Found tasks");

      return res.status(200).json(tasks);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.get(`/tasks/projects/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  getProjectTasks(authorization, +req.params.id)
    .then(function (tasks) {
      console.log("Found tasks");

      return res.status(200).json(tasks);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.route(`/tasks/:id`)
  .get((req: any, res) => {
    getTask(+req.params.id)
      .then(function (response) {
        return res.status(200).json(response);
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .put((req: any, res) => {
    const authorization = req.headers.authorization;
    const { t_name, t_description, assignee_id, task_status, t_deadline } = req.body;
    updateTaskDetails(authorization, +req.params.id, t_name, t_description, assignee_id, task_status, t_deadline)
      .then(function () {
        console.log("Updated task");
        return res.status(200).json({});
      })
      .catch(function (error) {
        console.log(error);
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })
  .delete((req: any, res) => {
    const authorization = req.headers.authorization;
    const jwtData = decodeToken(authorization);
    deleteTask(authorization, +req.params.id)
      .then(function () {
        console.log("deleted");
        return res.status(200).json({});
      })
      .catch(function (error) {
        const response = {
          "error": error.errorMessage
        }
        return res
          .status(error.statusCode)
          .json(response);
      })
  })

  .delete((req: any, res) => {
    const authorization = req.headers.authorization;
    const jwtData = decodeToken(authorization);
    deleteTask(authorization, +req.params.id)
      .then(function () {
        console.log("deleted");
        return res.status(200).json({});
      })
      .catch(function (error) {
      })
  })

app.get(`/user/:email`, (req: any, res) => {
  getIdFromEmail(req.params.email)
  .then(function (users) {
    return res.status(200).json(users);
  })
  .catch(function (error) {
    console.log(error);
    const response = {
      "error": error.errorMessage
    }
    return res
      .status(error.statusCode)
      .json(response);
  })
})

app.get(`/projects/:id/users`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getUsersOfProject(authorization, +req.params.id)
    .then(function (users) {
      console.log("Found users");

    return res.status(200).json(users);
  })
  .catch(function (error) {
    console.log(error);
    const response = {
      "error": error.errorMessage
    }
    return res
      .status(error.statusCode)
      .json(response);
  })
})

app.post(`/projects/:pid/:uid`, (req: any, res) => {
  const authorization = req.headers.authorization;

  addUserToProject(authorization, +req.params.uid, +req.params.pid)
    .then(function () {
      console.log("Added to project");

      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.delete(`/projects/:pid/:uid`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  removeUserFromProject(authorization, jwtData.uid, +req.params.uid, +req.params.pid)
    .then(function () {
      console.log("Removed from project");

      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.put(`/projects/:pid/:uid/promote`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);

  promoteUser(authorization, jwtData.uid, +req.params.uid, +req.params.pid)
    .then(function () {
      console.log("Promoted user");
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.put(`/projects/:pid/:uid/demote`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);

  demoteUser(authorization, jwtData.uid, +req.params.uid, +req.params.pid)
    .then(function () {
      console.log("Demoted user");
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.put(`/projects/:pid/leave`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);

  leaveProject(authorization, jwtData.uid, +req.params.pid)
    .then(function () {
      console.log("Demoted user");
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.post(`/messages/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  const { message } = req.body;
  sendMessage(authorization, jwtData.uid, +req.params.id, message)
    .then(function (id) {
      console.log("message sent")
      return res.status(200).json({ id });
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.put(`/messages/edit/:mid`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  const { message } = req.body;
  editMessage(authorization, jwtData.uid, message, +req.params.mid)
    .then(function () {
      console.log("message updated")
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.delete(`/messages/edit/:mid`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  deleteMessage(authorization, jwtData.uid, +req.params.mid)
    .then(function () {
      console.log("message deleted")
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.get(`/messages/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getMessages(authorization, jwtData.uid, +req.params.id)
    .then(function (messages) {
      console.log("messages found")
      return res.status(200).json(messages);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.post(`/friends/add/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  addFriend(authorization, jwtData.uid, +req.params.id)
    .then(function () {
      console.log("friend added")
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.delete(`/friends/remove/:id`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  removeFriend(authorization, jwtData.uid, +req.params.id)
    .then(function () {
      console.log("friend removed")
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})
app.get(`/friends`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getFriends(authorization, jwtData.uid)
    .then(function (friends) {
      console.log("found friends")
      return res.status(200).json(friends);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.get(`/requests`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getIncomingRequests(authorization, jwtData.uid)
    .then(function (requests) {
      console.log("found requests")
      return res.status(200).json(requests);
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.post(`/requests/send/:uid`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  const { r_type, p_id } = req.body;
  sendRequest(authorization, jwtData.uid, +req.params.uid, r_type, p_id)
    .then(function () {
      console.log("request sent")
      return res.status(200).json({});
    })
    .catch(function (error) {
      console.log(error);
      const response = {
        "error": error.errorMessage
      }
      return res
        .status(error.statusCode)
        .json(response);
    })
})

app.delete(`/requests/remove/:rid`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  removeRequest(authorization, jwtData.uid, +req.params.rid)
  .then(function() {
    console.log("request removed")
    return res.status(200).json({});
  })
  .catch(function (error) {
    console.log(error);
    const response = {
      "error": error.errorMessage
    }
    return res
    .status(error.statusCode)
    .json(response);
  })
}) 
app.get(`/user/:id/business`, (req: any, res) => {
  const authorization = req.headers.authorization;
  const jwtData = decodeToken(authorization);
  getBusyValue(authorization, jwtData.uid, +req.params.id)
  .then(function(value) {
    console.log("calculated value");
    return res.status(200).json({value});
  })
  .catch(function (error) {
    console.log(error);
    const response = {
      "error": error.errorMessage
    }
    return res
    .status(error.statusCode)
    .json(response);
  })
}) 




app.use(`/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = 5005;

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default server;