# 🎉 Eventally – Smart Event Management Platform

![Next.js](https://img.shields.io/badge/Next.js-Framework-black)
![React](https://img.shields.io/badge/React-Library-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Project-Active-success)

Eventally is a modern **event management web application** that allows users to create, manage, and participate in events easily.

The platform provides features such as **event creation, registration, reminders, notifications, comments, and personal dashboards**. It is built using **Next.js and React**, ensuring fast performance and a smooth user experience.

---

## 🚀 Features

### 👤 User Authentication

* Secure login system
* User profile management
* Forgot password functionality

### 📅 Event Management

* Create new events
* Edit events
* Delete events
* Import events
* View event details

### 📝 Event Registration

* Register for events
* Unregister from events
* View registered events

### 📊 Dashboard

* Track created events
* Manage registrations
* View event activity

### 💬 Interaction Features

* Comment on events
* Like events
* View event discussions

### 🔔 Notifications

* Event reminder emails
* Registration confirmation emails
* Unregistration notifications
* New event alerts

---

## 🛠 Tech Stack

### Frontend

* Next.js
* React
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Next.js API Routes

### Tools

* REST APIs
* Email services for notifications

---

## 📂 Project Structure

```
eventally
│
├── app
│   ├── create
│   ├── dashboard
│   ├── events
│   ├── events/[id]
│   ├── edit-event/[id]
│   ├── login
│   ├── forgot-password
│   ├── profile/[username]
│   ├── my-events
│   └── my-registrations
│
├── api
│   ├── comments
│   ├── events
│   ├── send-event-reminders
│   ├── send-registration-email
│   ├── send-unregistration-email
│   └── send-new-event-notification
│
└── public
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/eventally.git
```

### 2. Navigate to the Project Folder

```bash
cd eventally
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Open in Browser

```
http://localhost:3000
```

---

## 📡 API Endpoints

| Endpoint                         | Description                          |
| -------------------------------- | ------------------------------------ |
| `/api/events`                    | Manage events                        |
| `/api/comments`                  | Event comments                       |
| `/api/events/like`               | Like events                          |
| `/api/send-registration-email`   | Send registration confirmation email |
| `/api/send-unregistration-email` | Send unregistration email            |
| `/api/send-event-reminders`      | Send event reminders                 |

---

## 📸 Screenshots

(Add screenshots after deployment)

Example structure:

```
screenshots
│
├── home-page.png
├── dashboard.png
├── create-event.png
└── event-details.png
```

Example usage:

```
![Home Page](screenshots/home-page.png)
```

---

## 🌍 Deployment

You can deploy this project easily using **Vercel**.

Steps:

1. Push your code to GitHub
2. Connect the repository to **Vercel**
3. Deploy automatically

---

## 🔮 Future Improvements

* Advanced event search and filters
* Payment integration for paid events
* Admin dashboard
* Real-time notifications
* Improved mobile responsiveness

---

## 🤝 Contributing

Contributions are welcome!

Steps:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

⭐ If you like this project, consider **starring the repository on GitHub**.

