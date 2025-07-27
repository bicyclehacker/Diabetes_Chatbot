# 📘 API Documentation – Health Management App

> 🔐 All routes (except `/auth/register` and `/auth/login`) require authentication via Bearer Token (`Authorization: Bearer <token>`)

---

## 🧑‍⚕️ Auth Routes – `/api/auth`

| Method | Endpoint    | Description                | Body Params                 | Auth |
| ------ | ----------- | -------------------------- | --------------------------- | ---- |
| POST   | `/register` | Register a new user        | `name`, `email`, `password` | ❌   |
| POST   | `/login`    | Log in existing user       | `email`, `password`         | ❌   |
| GET    | `/me`       | Get current logged-in user | –                           | ✅   |
| DELETE | `/delete`   | Delete current user & data | –                           | ✅   |

---

## 🤖 Chatbot Routes – `/api/chat`

| Method | Endpoint | Description                | Body Params | Auth |
| ------ | -------- | -------------------------- | ----------- | ---- |
| POST   | `/`      | Send message to chatbot    | `message`   | ✅   |
| GET    | `/`      | Get all past chat messages | –           | ✅   |

---

## 📈 Glucose Routes – `/api/glucose`

| Method | Endpoint | Description               | Body Params                          | Auth |
| ------ | -------- | ------------------------- | ------------------------------------ | ---- |
| POST   | `/`      | Add a new glucose reading | `value`, `unit`, `timestamp`, `note` | ✅   |
| GET    | `/`      | Get all glucose readings  | –                                    | ✅   |
| PUT    | `/:id`   | Update a glucose reading  | Same as POST                         | ✅   |
| DELETE | `/:id`   | Delete a glucose reading  | –                                    | ✅   |

---

## 🍱 Meal Routes – `/api/meals`

| Method | Endpoint | Description         | Body Params                             | Auth |
| ------ | -------- | ------------------- | --------------------------------------- | ---- |
| POST   | `/`      | Log a meal          | `name`, `calories`, `timestamp`, `note` | ✅   |
| GET    | `/`      | Get all meal logs   | –                                       | ✅   |
| PUT    | `/:id`   | Update a meal entry | Same as POST                            | ✅   |
| DELETE | `/:id`   | Delete a meal       | –                                       | ✅   |

---

## 💊 Medication Routes – `/api/medications`

| Method | Endpoint | Description         | Body Params                       | Auth |
| ------ | -------- | ------------------- | --------------------------------- | ---- |
| POST   | `/`      | Add a medication    | `name`, `dosage`, `time`, `notes` | ✅   |
| GET    | `/`      | Get all medications | –                                 | ✅   |
| PUT    | `/:id`   | Update medication   | Same as POST                      | ✅   |
| DELETE | `/:id`   | Delete medication   | –                                 | ✅   |

---

## 💬 Message Routes – `/api/messages`

| Method | Endpoint | Description                              | Body Params         | Auth |
| ------ | -------- | ---------------------------------------- | ------------------- | ---- |
| POST   | `/`      | Send a message in chat                   | `chatId`, `message` | ✅   |
| GET    | `/`      | Get all messages (optionally for a chat) | –                   | ✅   |

---

## ⏰ Reminder Routes – `/api/reminders`

| Method | Endpoint | Description        | Body Params                               | Auth |
| ------ | -------- | ------------------ | ----------------------------------------- | ---- |
| POST   | `/`      | Create a reminder  | `title`, `type`, `time`, `repeat`, `note` | ✅   |
| GET    | `/`      | List all reminders | –                                         | ✅   |
| PUT    | `/:id`   | Update a reminder  | Same as POST                              | ✅   |
| DELETE | `/:id`   | Delete a reminder  | –                                         | ✅   |

"""
