# 🎙️ ConvoIT

**ConvoIT** is a real-time chat and follow-request application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.io**. It enables users to register, send and manage follow (message) requests, and chat in real-time. It closely resembles social media and chat applications in functionality and feel.

---

## 🚀 Features

- **User Authentication**
  - JWT-based signup & login
  - Protected routes for authenticated users

- **Follow-Request System**
  - Send, accept, or deny follow/message requests
  - Real-time notifications (emit/receive via Socket.io)
  - Persistent notifications saved in local storage

- **Followers Management**
  - View followers list with profile pictures
  - Dynamically update UI after accept/deny actions

- **Real-Time Chat**
  - One-to-one chat between users
  - Instant messaging with real-time UI updates

- **Responsive UI**
  - Clean design using **Tailwind CSS**
  - Responsive layout for both desktop and mobile

---

## 🧱 Tech Stack

| Layer       | Technology                            |
|-------------|----------------------------------------|
| Frontend    | React, React Router, Axios, Tailwind CSS, React Hot Toast, Socket.io Client |
| Backend     | Node.js, Express, MongoDB, Socket.io |
| Auth        | JWT (JSON Web Tokens) |
| Database ORM | Mongoose (MongoDB) |

---

## 📁 Repository Structure

```
/.
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│   └── public/
├── server/                # Node.js backend
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── configs/           # Socket & other configs
│   └── server.js          # Express Server entrypoint
└── README.md              # Project documentation
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/Kharthicsj/ConvoIT.git
cd ConvoIT
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file:
```
MONGO_DB=<Your MongoDB URI>
CLOUDINARY_CLOUD_NAME=<Your Cloudinary's Cloud Name>
CLOUDINARY_API_KEY=<Cloudinary API Key>
CLOUDINARY_API_SECRET=<Cloudinary API Secret Key>
CLOUDINARY_URL=<Cloudinary URL>
FRONT_END_URL=<Frontend URL>

```
- Run the backend server:
```bash
nodemon server.js
```

### 3. Frontend Setup
```bash
cd client
npm install
```
- Create a `.env` file:
```
VITE_API_URL=<Your Frontend URL>
VITE_ENCRYPTION_PASSWORD=<Your Encryption Password>

```
- Run the development server:
```bash
npm run dev
```
- Visit `http://localhost:5173` to use the app.

---

## 🎯 How To Use

1. Sign up and log in.
2. Search for users, send follow/message requests.
3. Accept or deny requests—notifications update in real-time.
4. See your followers list populate instantly.
5. Start chatting with accepted users in real time!

---

## 🧩 Common Use Cases

- 📨 **Send Request**  
  Search users → send follow request → receiver gets real-time notification.

- ✅ **Accept Request**  
  Receiver accepts request → front and back states update instantly via Socket.io.

- ❌ **Deny Request**  
  Receiver denies request → removes pending notification; sender not affected.

- 💬 **Chat**  
  Once followers are connected, chat becomes available—easy messaging flow enabled.

---

## 🧪 Testing

Use **Postman** or **Insomnia** to test API:

- POST `/signup` – Register user  
- POST `/signin` – Get auth token  
- POST `/follow/request` – Send follow request  
- POST `/follow/accept` – Accept request  
- POST `/follow/deny` – Deny request  
- GET `/follow/followers/:userId` – Get followers list  

Don't forget to include `Authorization: Bearer <token>` header for protected endpoints!

---

## 🛠️ Contributing

1. Fork the repo  
2. Create feature branch: `git checkout -b feat/my-feature`  
3. Commit changes with meaningful messages  
4. Push and open a pull request  

Let's build awesome things together!

---

## 👤 Author

**Kharthic S J**  
Full‑Stack Developer  
[GitHub](https://github.com/Kharthicsj) · [LinkedIn](https://www.linkedin.com/in/kharthic-sj-188235256/)

