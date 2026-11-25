# Technical Decisions – Coffee Ninja

This document explains the main assumptions, technical decisions and trade-offs made while developing the Customer Inquiry Management System.

## 1. Inquiry Ownership and Access Control

**Decision:** Staff members can view and manage only the inquiries they created.

Each inquiry stores the ID of the staff member who created it through the `created_by` field. The backend checks ownership when retrieving, listing and updating inquiries.

**Reason:** Customer inquiry information should not be accessible to unrelated staff members.

**Trade-off:** Staff members cannot view inquiries created by other staff members. A future version could introduce manager-level access if required.

## 2. Inquiry Status Management

**Decision:** Three statuses are supported: New, In Progress and Resolved.

Staff members can change an inquiry to any valid status, including reopening a previously resolved inquiry.

**Reason:** A customer may report that an issue has returned or was not fully resolved.

**Trade-off:** The system does not enforce a strict sequence of status transitions. This keeps the workflow flexible but allows staff to select any valid status.

## 3. Input Validation and Duplicate Inquiries

**Decision:** Customer name, contact, subject and description are required. Empty or whitespace-only values are rejected by both the frontend and backend.

Field lengths are limited to prevent excessively large input. Duplicate inquiries are allowed.

**Reason:** Validation improves data quality, while allowing duplicates supports situations where the same customer reports separate issues.

**Trade-off:** The system does not automatically identify potentially duplicated inquiries. This could be improved with duplicate detection in a future version.

## 4. Data Refresh and Synchronisation

**Decision:** The dashboard uses manual refresh rather than real-time synchronisation between browser tabs.

After creating an inquiry or successfully updating its status, the dashboard refreshes its data. If another tab changes an inquiry, the current tab may display older information until refreshed.

**Reason:** Manual refresh provides a simple and reliable approach without introducing additional real-time infrastructure.

**Trade-off:** Users must refresh the dashboard to see changes made in another tab.

## 5. Authentication and Database Access

**Decision:** Passwords are stored as bcrypt hashes, and successful login generates a JWT with a one-hour expiry.

Protected API endpoints require a valid Bearer token. Database queries use parameterised SQL statements.

**Reason:** Password hashing protects stored credentials, token authentication protects API access, and parameterised queries help prevent SQL injection.

**Trade-off:** The application does not currently include password reset or staff registration functionality.

## 6. Testing Approach

**Decision:** Backend tests use the Node.js test runner and Supertest. Frontend tests use Vitest and React Testing Library.

Tests cover authentication, inquiry ownership, input validation, invalid IDs, missing inquiries, API behaviour and frontend loading and empty states.

**Reason:** Testing both backend and frontend behaviour helps identify problems before submission.

**Trade-off:** The current tests do not provide complete end-to-end coverage against a live PostgreSQL database and browser.

## 7. Future Improvements

Possible improvements include:

- Real-time updates between multiple users or browser tabs.
- Environment-based frontend API configuration.
- Staff account management and password reset.
- Duplicate inquiry detection.
- More extensive end-to-end testing.

These improvements were not included to keep the implementation focused on the assessment requirements.

## 8. Use of AI Assistance

ChatGPT was used as a development assistant to help understand requirements, discuss implementation approaches, troubleshoot errors, review code, and prepare tests and documentation.

One useful suggestion was to distinguish dashboard loading, empty and error states. This was reviewed and implemented so that a failed request does not incorrectly display an empty inquiry list.

AI-generated suggestions were reviewed and tested during development. The developer remains responsible for the submitted implementation and its behaviour.