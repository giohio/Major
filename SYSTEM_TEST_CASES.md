# SYSTEM TEST CASES
**Project:** Mental Health Support System (Major)
**Date:** 14/12/2025
**Version:** 1.0

This document outlines the comprehensive test cases for the Major Mental Health Support System.

---

## 1. Authentication & Authorization (Auth)
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **AUTH-001** | Login | **Login - Valid Credentials** | Active account | 1. Enter valid email & password<br>2. Click Login | Redirect to Role-specific Dashboard (User/Doctor/Admin) | High |
| **AUTH-002** | Login | **Login - Invalid Password** | Active account | 1. Enter valid email & wrong password | Show "Invalid credentials" error | High |
| **AUTH-003** | Login | **Login - Non-existent User** | None | 1. Enter unregistered email | Show "User not found" or generic error | High |
| **AUTH-004** | Login | **Login - Empty Fields** | None | 1. Leave Email/Password empty<br>2. Click Login | Show "This field is required" validation | Medium |
| **AUTH-005** | Register | **Register - Success** | Email unique | 1. Fill Name, Email, Password, Confirm Pass<br>2. Click Register | Account created, redirected to Login/Dashboard | High |
| **AUTH-006** | Register | **Register - Duplicate Email** | Email exists | 1. Enter existing email<br>2. Click Register | Show "Email already in use" error | High |
| **AUTH-007** | Register | **Register - Weak Password** | None | 1. Enter password < 6 chars | Show password strength requirement | Medium |
| **AUTH-008** | Register | **Register - Password Mismatch** | None | 1. Enter different passwords | Show "Passwords do not match" error | Medium |
| **AUTH-009** | Security | **Protected Route Access** | Not logged in | 1. Access `/user/dashboard` URL | Auto-redirect to `/login` | High |
| **AUTH-010** | Security | **Role-Based Access (User -> Admin)** | Logged as User | 1. Access `/admin/dashboard` URL | Redirect to Home or 403 Forbidden | High |
| **AUTH-011** | Logout | **Logout - Flow** | Logged in | 1. Click Profile -> Logout | Token cleared, redirect to Landing Page | High |

## 2. User Module - Account & Settings
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **USR-001** | Profile | **View Profile** | Logged in | 1. Go to `/user/profile` | Show correct Name, Email, Plan info | Medium |
| **USR-002** | Profile | **Update Profile Info** | Logged in | 1. Edit Name/Phone<br>2. Click Save | "Profile updated" toast, data persists | Medium |
| **USR-003** | Profile | **Change Avatar** | Logged in | 1. Upload new image | Avatar updates in header and profile | Low |
| **USR-004** | Settings | **Change Password - Success** | Logged in | 1. Enter Old & New Password<br>2. Save | Success message, new password active | High |
| **USR-005** | Settings | **Change Password - Wrong Old** | Logged in | 1. Enter wrong Old Password | Show "Incorrect old password" error | Medium |
| **USR-006** | Settings | **Notification Preferences** | Logged in | 1. Toggle Email/Browser notifications | Preferences saved to database | Low |
| **USR-007** | Payments | **View History** | Has payments | 1. Go to `/user/payments` | Show list of past transactions with Status | Low |

## 3. User Module - Mental Health Features
### 3.1 ChatBot & AI
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **CHAT-001** | Chat | **Send Message - Normal** | Logged in | 1. Type "Hello"<br>2. Send | Message shows, AI replies, Sentiment=Neutral | High |
| **CHAT-002** | Chat | **Send Message - Emotion** | Logged in | 1. Type "I am very angry"<br>2. Send | AI detects "Anger", response is empathetic | High |
| **CHAT-003** | Chat | **Send Message - Danger** | Logged in | 1. Type "I want to hurt myself"<br>2. Send | AI detects "Critical", shows crisis alert popup | High |
| **CHAT-004** | Chat | **Session Continuity** | Chatting | 1. Send Msg A<br>2. Send Msg B | Both messages belong to same Session ID | High |
| **CHAT-005** | Chat | **Start New Chat** | In chat | 1. Click "New Chat" | Screen clears, URL session param removed | Medium |
| **CHAT-006** | History | **View History** | Has chats | 1. Go to `/user/history` | List of past sessions with dates/titles | Medium |
| **CHAT-007** | History | **Delete Session** | Has chats | 1. Click Delete icon on a session | Confirm dialog -> Session removed from list | Low |

### 3.2 Emotion Dashboard
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **EMO-001** | Dashboard | **Load Stats** | Has data | 1. Open Dashboard | Pie Chart & Line Chart load with data | High |
| **EMO-002** | Dashboard | **Empty State** | No data | 1. Open Dashboard | Show "No data" placeholders gracefully | Medium |
| **EMO-003** | Dashboard | **Insights Display** | Has data | 1. Check "Insights" cards | Show "Stable", "Improving" or " Needs Attention" | Medium |

### 3.3 Exercises
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **EXE-001** | Exercises | **List Exercises** | Logged in | 1. Go to `/user/exercises` | Show Cards with Breathing, Meditation, etc. | Medium |
| **EXE-002** | Exercises | **View Detail** | Logged in | 1. Click an Exercise | Show Instructions, Video/Gif, Start button | Medium |
| **EXE-003** | Exercises | **Complete Exercise** | In detail | 1. Click Start<br>2. Wait/Click Finish | Show "Completed" toast, update Progress | Medium |

### 3.4 Appointments & Booking
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **APT-001** | Find Doctor | **Search Doctor** | Logged in | 1. Enter "Dr. A" or "Psychology" | List filters to match query | High |
| **APT-002** | Find Doctor | **Filter Advanced** | Logged in | 1. Filter Rating > 4, Price < 500k | List updates correctly | Medium |
| **APT-003** | Booking | **Book - Available Slot** | Selected Doc | 1. Click Book<br>2. Select Date/Time | Slot selected, "Confirm" button enabled | High |
| **APT-004** | Booking | **Book - Unavailable Slot** | Selected Doc | 1. Select grayed-out slot | Cannot select, or show "Unavailable" | Medium |
| **APT-005** | Booking | **Submit Booking** | Slot picked | 1. Click Confirm Booking | Redirect to Payment or Success Page | High |
| **APT-006** | My Apts | **View Upcoming** | Has apt | 1. Go to `/user/appointments` | Show booked appointment in "Upcoming" tab | High |
| **APT-007** | My Apts | **Cancel Appointment** | Has apt | 1. Click Cancel | Status -> "Cancelled", refund logic (if any) | Medium |

## 4. Payment Module
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **PAY-001** | Gateway | **Pay via VNPay** | Checkout | 1. Select VNPay -> Pay | Redirect to VNPay, Complete, Redirect Back Success | High |
| **PAY-002** | Gateway | **Pay via MoMo** | Checkout | 1. Select MoMo -> Pay | Show QR Code / Redirect MoMo | High |
| **PAY-003** | Gateway | **Pay via ZaloPay** | Checkout | 1. Select ZaloPay -> Pay | Show QR Code / Redirect ZaloPay | High |
| **PAY-004** | Status | **Verify Success** | Paid | 1. Check DB/History | Status = 'completed', Service activated | High |
| **PAY-005** | Status | **Handle Failure** | Cancelling | 1. Cancel at Gateway | Redirect Back Failed, Status != 'completed' | Medium |

## 5. Doctor Portal Module
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **DOC-001** | Dashboard | **Load Dashboard** | Logged in | 1. Check stats cards | Show Total Patients, Appointments Today | High |
| **DOC-002** | Patients | **View Patient List** | Logged in | 1. Go to Patients | List of assigned patients appears | High |
| **DOC-003** | Patients | **Patient Profile** | Selected Pat | 1. Click Patient | View Bio, History, Notes | High |
| **DOC-004** | Chat | **Chat with Patient** | Selected Pat | 1. Click Chat | Open chat interface, send message to patient | High |
| **DOC-005** | Schedule | **View Schedule** | Logged in | 1. Go to Appointments | Calendar view of bookings | Medium |
| **DOC-006** | Notes | **Add Clinical Note** | In patient | 1. Type note<br>2. Save | Note saved to patient record | High |

## 6. Admin Portal Module
| ID | Module | Test Case | Pre-conditions | Steps | Expected Result | Priority |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **ADM-001** | Users | **Manage Users** | Logged in | 1. Deactivate User | User status -> 'inactive' | Medium |
| **ADM-002** | Doctors | **Approve Doctor** | New Doctor | 1. Check pending docs<br>2. Approve | Doctor account active, can login | High |
| **ADM-003** | Plans | **Edit Plan Price** | Logged in | 1. Edit "Premium"<br>2. Update Price | Price updated for new subscriptions | Medium |
| **ADM-004** | AI Models | **Switch Model** | Logged in | 1. Change AI Config | System uses new model (verify via chat) | Low |
| **ADM-005** | Analytics | **View Reports** | Logged in | 1. Load Analytics | Show Revenue, User Growth charts | Low |

## 7. Non-Functional (NFR)
| ID | Module | Test Case | Steps | Expected Result |
|:---:|:---:|:---|:---|:---|
| **NFR-001** | Perf | **API Latency** | Network Tab | Key APIs respond < 500ms |
| **NFR-002** | Reliability | **AI Timeout Handling** | Simulate slow AI | Client waits 120s, Backend waits 90s, no crash |
| **NFR-003** | UI/UX | **Responsive Mobile** | View on iPhone SE | Layout stacks correctly, no scroll overlap |
| **NFR-004** | Security | **XSS Protection** | Chat Input | Inject `<script>alert(1)</script>` -> Rendered as text |
