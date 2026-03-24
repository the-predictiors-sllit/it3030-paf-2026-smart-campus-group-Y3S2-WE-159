## Folder structure

#### To chck the database connection use this link
http://localhost:8080/api/test/dg-check



```src/main/java/com/smartcampus/backend/
├── config/              # (Existing) WebConfig, etc.
├── controller/          # REST Endpoints (The "Waiters")
├── dto/                 # Data Transfer Objects (What you send to Next.js)
├── model/               # Database Entities (The "Ingredients")
├── repository/          # Database Interfaces (The "Pantry Access")
├── service/             # Business Logic (The "Chefs")
└── BackendApplication   # (Existing)```



1. REST Endpoints (The "Controller")

These are your Request Handlers. Their only job is to manage the "conversation" with your Next.js frontend. They don't know how the data is calculated; they just know how to receive an HTTP request and send an HTTP response.

    Responsibility:
        * Listening for incoming URLs (e.g., GET /api/students).
        * Extracting parameters (e.g., ID numbers or search terms).
        *Sending back the correct HTTP Status Codes (e.g., 200 OK, 404 Not Found, 500 Server Error).
        *Delegating the actual work to the Service layer.

2. Data Transfer Objects (The "DTO")

These are simple "containers" or "envelopes." You use them because you rarely want to send your raw database object (Model) directly to the frontend.

    Responsibility:
        * Filtering: If your Student model has a password field or an internal_database_id, you do not want that sent to the browser. You create a StudentDTO that only includes name and email.
        * Formatting: If your database stores a birthday as a LocalDateTime, but your Next.js app needs it as a formatted String, the DTO lets you change the "shape" of that data.
        * Decoupling: If you change your database structure, you don't necessarily have to break your frontend. You just update the conversion logic in your Service layer to keep the DTO looking the same for the frontend.


To be precise about the order of operations, here is the flow of a typical "Get Data" request:

    1. Request: Next.js sends an HTTP request to your Controller.

    2. Delegation: The Controller asks the Service layer for the data.

    3. Data Fetch: The Service layer gets the raw data from the Repository/Model (the database).

    4. Conversion (The "Secret Sauce"): The Service layer takes that raw database Model and maps it into your DTO. This is where you strip out sensitive info (like passwords) and format dates/names to exactly what your frontend expects.

    5. Response: The Service returns the DTO to the Controller, which then sends that DTO back to Next.js as JSON.