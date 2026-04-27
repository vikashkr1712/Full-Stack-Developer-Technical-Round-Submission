# Patient Management System

Simple MERN stack project for the healthcare industry. The app is intentionally kept basic so it is easy to explain in an interview.

## Pages

1. Home Page - simple welcome page with navigation links.
2. Admin Login Page - basic admin login with username and password.
3. Patient Registration Page - add, edit, and delete patient details.
4. Doctor Listing Page - show a static list of four doctors.
5. Appointment Booking Page - select patient, doctor, date, and time.
6. Dashboard Page - view all patients and appointments in tables.

## Core Features

- Admin login using JWT authentication.
- Add, edit, delete, and view patients.
- Book and delete appointments.
- View all patients and appointments on the dashboard.
- Responsive UI using simple custom CSS.

## Tech Stack

- Frontend: React.js + React Router
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT

## Folder Structure

- `client/` - React frontend
- `server/` - Express backend

## Setup Instructions

### 1. Install dependencies

Run these commands from the project root:

```bash
npm install
cd server
copy .env.example .env
cd ../client
copy .env.example .env
```

### 2. Configure environment variables

Update `server/.env` if needed:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<db_password>@cluster0.qn4eod8.mongodb.net/patientdb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=patient_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin12345
```

Atlas note:

- Replace `<username>` and `<db_password>` with your real MongoDB Atlas database user credentials.
- Ensure your Atlas user has read/write access to `patientdb`.
- In Atlas Network Access, allow your current IP (or `0.0.0.0/0` for testing only).

Update `client/.env` if your backend runs on a different URL:

```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the backend

```bash
npm run dev:server
```

### 4. Run the frontend

Open a second terminal:

```bash
npm run dev:client
```

## Login Details

- Username: `admin`
- Password: `admin12345`

## API Endpoints

- `POST /api/auth/login`
- `GET /api/doctors`
- `GET /api/patients`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`
- `GET /api/appointments`
- `POST /api/appointments`
- `DELETE /api/appointments/:id`

## Live Deployment URL

Add your deployed frontend or full-stack URL here after hosting on Render, Vercel, or Firebase.

## Notes

- The doctor list is static and contains four doctors as requested.
- The project avoids extra advanced features to keep it simple and easy to present.


