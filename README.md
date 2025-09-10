🚌 Bus Reservation System

A full-stack bus reservation system with separate admin and user interfaces, built with Spring Boot, React, and MySQL.

🔗 GitHub Repository: https://github.com/Reshma-murugan/busbook.git

✨ Features
Admin Panel

📊 Dashboard with booking statistics and revenue

🚌 Bus management (add, edit, delete routes)

🎟️ Booking management and tracking

👥 User management

📱 Responsive design

User Portal

🔐 User registration and authentication

🔍 Search and book bus tickets

📅 View and cancel bookings

👤 Profile management

📱 Mobile-friendly interface

🛠️ Tech Stack
Frontend

Admin Panel & User Portal: React 18 with Vite

Styling: Custom CSS (no frameworks)

State Management: React Context API

Routing: React Router

HTTP Client: Axios

Backend

Framework: Spring Boot 3.3.x

Security: Spring Security + JWT

Database: MySQL 8.0+

ORM: JPA/Hibernate

Build Tool: Maven (or Maven Wrapper included)

🚀 Getting Started
Prerequisites

Java 21 or higher

Node.js 16+ and npm/yarn

MySQL 8.0+

IntelliJ IDEA (Community or Ultimate)

Backend Setup with IntelliJ (Recommended)

Open Project

Open IntelliJ → File → Open → backend folder

Configure Database

Update src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/busbook
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_jwt_secret


Run the Application

Open BackendApplication.java (the main Spring Boot class)

Click Run ▶ in IntelliJ toolbar

✅ No need to install Maven separately; IntelliJ can handle it using the included Maven Wrapper (mvnw).

Frontend Setup
Admin Panel
cd admin-app
npm install
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
npm run dev

User Portal
cd user-app
npm install
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
npm run dev

🌐 API Endpoints (Highlights)

Authentication

POST /api/auth/register – User/Admin registration

POST /api/auth/login – User/Admin login

Admin Operations

POST /api/admin/buses - Create Bus

GET /api/admin/buses – Get all buses

PUT /api/admin/buses/{id} – Update bus

DELETE /api/admin/buses/{id} – Delete bus

GET /api/admin/buses/today - Get today's buses

GET /api/admin/bookings - Get all bookings

User Operations

GET /api/user/search?from={from}&to={to}&date={date} – Search buses by route and date

GET /api/user/buses/{busId}/seats?fromSeq={fromSeq}&toSeq={toSeq}&date={date} – Get seat availability

POST /api/user/book – Book seats

GET /api/user/bookings/me – User's booking history

PATCH /api/user/bookings/{bookingId}/cancel – Cancel booking

Full endpoints are implemented, but these are the main ones for basic usage.

📦 Sample Data

Bus: Meghna Travels

Route: Chennai → Madurai → Coimbatore → Tirunelveli

Pricing example:

Chennai → Madurai: ₹500

Chennai → Coimbatore: ₹700

Madurai → Coimbatore: ₹200

Coimbatore → Tirunelveli: ₹300

## 🎥 Demo Videos

⚠️ GitHub may not play videos directly due to file size limits.  
You can **download them** to watch on your device:

- [⬇️ Download Admin App Demo Video](admin-app/src/demo_vdo/adminApp.mp4)  
- [⬇️ Download User App Demo Video](user-app/src/demo_vdo/userApp.mp4)


```
📂 Project Structure
busbook/
├── admin-app/          # Admin React frontend
│   ├── src/            # Source files
│   ├── public/         # Static files
│   └── package.json    # Dependencies
│
├── user-app/           # User React frontend
│   ├── src/            # Source files
│   ├── public/         # Static files
│   └── package.json    # Dependencies
│
├── backend/            # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/busbook/
│   │   │   │   ├── config/      # Security & app configs
│   │   │   │   ├── controller/  # REST controllers
│   │   │   │   ├── model/       # Entity classes
│   │   │   │   ├── repository/  # Data access layer
│   │   │   │   ├── security/    # Security config & JWT
│   │   │   │   └── service/     # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml                 # Maven configuration
│
├── .gitignore         # Git ignore rules
├── README.md          # Project documentation
└── LICENSE           # License file
```

🧪 Testing

Run backend tests from IntelliJ:

Right-click backend/src/test → Run All Tests

Or via Maven Wrapper:

./mvnw test

🚀 Deployment
Backend
./mvnw clean package
java -jar target/busbook-0.0.1-SNAPSHOT.jar

Frontend
cd admin-app
npm run build

cd ../user-app
npm run build

🤝 Contributing

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License

This project is licensed under the MIT License – see the LICENSE
 file for details.