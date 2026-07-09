# Design Document

This project is a salon appointment booking system built using NestJS, PostgreSQL and Prisma.

The system supports two different types of users:

- Business Owner (Salon Owner)
- Customer

Business owners manage their salon, services, working hours and bookings, while customers can browse services and book appointments.

The primary goal of the design is to keep the data model simple, maintain data integrity and avoid double bookings.

---

# Database Design

## User

Stores all authenticated users in the system.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Hashed password |
| role | Enum | OWNER or CUSTOMER |
| createdAt | DateTime | Record creation time |
| updatedAt | DateTime | Last updated |

### Reason

Instead of maintaining separate tables for owners and customers, a single User table with a role field keeps authentication simple and avoids duplicate logic.

---

## Business

Represents a salon.

| Field | Type |
|-------|------|
| id | String |
| ownerId | String |
| businessName | String |
| phone | String |
| address | String |
| createdAt | DateTime |
| updatedAt | DateTime |

### Relationship

- One User (OWNER) → One Business

### Reason

Each owner manages exactly one salon.

Keeping business information separate from the user allows additional business-related fields to be added later without affecting authentication.

---

## Service

Represents services offered by the salon.

Examples:

- Haircut
- Facial
- Hair Spa

| Field | Type |
|-------|------|
| id | String |
| businessId | String |
| name | String |
| duration | Integer |
| price | Decimal |
| isActive | Boolean |

### Relationship

One Business → Many Services

### Reason

Services belong to a business instead of directly to a user.

Soft deletion is implemented using the `isActive` field so historical bookings remain valid.

---

## Availability

Stores weekly working hours.

| Field | Type |
|-------|------|
| id | String |
| businessId | String |
| day | WeekDay |
| startTime | String |
| endTime | String |

### Relationship

One Business → Many Availability records

### Reason

Working hours are defined per weekday.

This structure makes it easy to generate appointment slots later.

---

## Booking

Stores customer appointments.

| Field | Type |
|-------|------|
| id | String |
| customerId | String |
| serviceId | String |
| bookingDate | Date |
| startTime | DateTime |
| endTime | DateTime |
| serviceName | String |
| price | Decimal |
| status | BookingStatus |

### Relationship

Customer → Many Bookings

Service → Many Bookings

### Reason

The booking stores a copy of the service name and price.

This ensures historical bookings remain accurate even if the owner changes the service name or price later.

---

# Entity Relationship

```

User (OWNER)
│
└── Business
│
├── Services
├── Availability
└── Bookings

User (CUSTOMER)
│
└── Bookings

```

---

# API Design

## Authentication

| Method | Endpoint | Access | Description |
|----------|---------------------------|----------|----------------------------|
| POST | /auth/register-owner | Public | Register salon owner |
| POST | /auth/register-customer | Public | Register customer |
| POST | /auth/login | Public | Login |
| GET | /auth/profile | Authenticated | Current user profile |

---

## Business

| Method | Endpoint | Access |
|----------|-----------------|------------|
| GET | /business/me | Owner |
| PATCH | /business/me | Owner |
| GET | /business/:id | Public |

---

## Services

| Method | Endpoint | Access |
|----------|------------------|------------|
| POST | /services | Owner |
| GET | /services | Public |
| GET | /services/:id | Public |
| PATCH | /services/:id | Owner |
| DELETE | /services/:id | Owner |

---

## Availability

| Method | Endpoint | Access |
|----------|----------------------|------------|
| POST | /availability | Owner |
| GET | /availability/me | Owner |
| PATCH | /availability/:id | Owner |
| DELETE | /availability/:id | Owner |

---

## Bookings

| Method | Endpoint | Access |
|----------|----------------------------|-------------|
| GET | /bookings/slots | Public |
| POST | /bookings | Customer |
| GET | /bookings/me | Customer |
| GET | /bookings/business | Owner |
| PATCH | /bookings/:id/status | Owner |
| DELETE | /bookings/:id | Customer |

---

# Authentication Design

Authentication is implemented using JWT.

Every authenticated request requires a Bearer token.

The authenticated user's role is stored inside the JWT payload.

```

{
"id": "...",
"email": "...",
"role": "OWNER"
}

```

Authorization is enforced using NestJS Guards.

Roles are protected using a custom `@Roles()` decorator.

Examples:

- Only owners can create services.
- Only customers can create bookings.
- Both owners and customers can access their own profile.

---

# Business Rules & Edge Cases

## Duplicate Email

A user cannot register using an email address that already exists.

Response:

```

400 Bad Request

```

---

## Duplicate Booking

A customer cannot book an already occupied time slot.

Before creating a booking the system checks whether another booking already exists with the same service and start time.

---

## Invalid Service

Bookings cannot be created for services that do not exist.

Response:

```

404 Not Found

```

---

## Closed Day

Bookings are only allowed on days where availability has been configured.

If the salon is closed on the selected day, no appointment slots are returned.

---

## Service Duration

Appointment slots are generated based on the service duration.

For example:

- 30 minute service → every 30 minutes
- 60 minute service → every hour

---

## Historical Prices

A booking stores the service name and price at the time of booking.

Future price changes do not affect existing bookings.

---

## Soft Delete

Services are never permanently deleted.

Instead, `isActive` is set to false.

This prevents historical bookings from losing their relationship to the service.

---

## Authorization

Owners cannot access customer-only endpoints.

Customers cannot manage services or availability.

JWT guards and role guards enforce these restrictions.

---

# Assumptions

The assignment leaves some implementation details open, so the following assumptions were made.

- Each owner manages a single business.
- A customer can book multiple appointments.
- Payments are outside the scope of this project.
- Appointment reminders are not implemented.
- Availability is configured weekly rather than for specific dates.
- Appointment cancellation is allowed at any time.
- Time slots are generated dynamically instead of being stored in the database.
- Time zone handling assumes both customer and salon operate in the same local time zone.


