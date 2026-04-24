# 📚 EduLib — Smart Library Management System

A modern, full-stack Library Management System built for educational institutions. EduLib simplifies book management, borrowing, returns, fine tracking, and much more — making the library experience smooth for students, librarians, and admins.

🔗 **Live Site**: [edulib.vercel.app](https://edulib.vercel.app/)
💻 **GitHub**: [Sumanth-Vallabhaneni-03/EDULIB](https://github.com/Sumanth-Vallabhaneni-03/EDULIB)

---

## ✨ Features

### 👤 Authentication & Roles
- **3 roles**: Student, Librarian, Admin
- Login with **email** or **roll number**
- Roll number field during registration (optional, for students)
- **Admin approval flow** — new signups start as "pending", admin approves before access is granted
- Pending users see a clean "Awaiting Approval" screen

### 📖 Book Management
- Add, edit, delete books (Admin/Librarian)
- Rich book detail page with cover, author, publisher, copies
- **Search** by title, author, or category
- Book availability badges (Available / Checked Out)

### 📤 Book Issuing
- Issue books using **roll number or email** (no more MongoDB IDs!)
- Auto-validates student account status before issuing
- Configurable loan duration (default: 30 days)
- **🖨️ Print Issue Slip** — one-click printable receipt with student details, book info, and due date

### 💸 Fine System
- **₹5/day** overdue fine (configurable constant)
- Fine calculated **server-side** on return (tamper-proof)
- Confirmation dialog shows fine before processing return
- **Mark Fine as Paid** or **Waive Fine** buttons on returned books
- Fine status badges: Pending (red), Paid (green), Waived (teal)

### 📅 Overdue & Due-Soon Dashboard
- **Overdue tab**: All overdue books with student contact, days overdue, and fine
- **Due in 7 Days tab**: Early warning for upcoming returns
- CSV export for both views

### 📊 Admin Dashboard Stats
- Home page stat cards for admin/librarian:
  - Total Books | Total Students | Active Issues | Overdue | Total Fines
- Real-time aggregated data from MongoDB

### 📖 Book Request System
- Students can **request unavailable books** from the book detail page
- Optional note (e.g., "Need for exam prep")
- Admin sees all pending requests → can **Fulfill** or **Reject**
- Students can cancel their own requests

### 🔖 Bookmark / Wishlist
- Bookmark any book from the library grid or detail page
- Dedicated **Bookmarks tab** in student profile
- Bookmarks persist across sessions

### 📚 Reading History
- Students see all books ever borrowed with dates and fine status
- Quick stat cards: Total Borrowed, Currently Active, Returned
- **CSV export** of reading history

### 👩‍💼 Student Management
- Admin views all students with roll numbers
- **Bulk Import** via CSV — download template, fill in Excel/Sheets, upload, preview, import
- **Pending Approvals** tab — approve or reject new registrations
- CSV export of pending users

### 📤 CSV Export
Available for: Overdue books, Due-soon books, Reading history, Pending approvals, Student list

### 📈 Reports
- Admin-only Reports tab with aggregate stats:
  - Total books, students, issued books, returned books
  - Revenue from fines

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Ant Design, Vanilla CSS (custom warm theme) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Deployment** | Vercel (both frontend + serverless backend) |
| **Fonts** | Google Fonts (Inter, Merriweather) |
| **Icons** | Remix Icon |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repo
git clone https://github.com/Sumanth-Vallabhaneni-03/EDULIB.git
cd EDULIB

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create `server/.env`:

```env
mongo_url=mongodb+srv://your-connection-string
jwt_secret=your_secret_key
PORT=5000
```

### Running Locally

```bash
# Terminal 1 — Backend
cd server
npm run dev  # or: nodemon server.js

# Terminal 2 — Frontend
cd client
npm start
```

The client runs on `http://localhost:3000`, backend on `http://localhost:5000`.

> **Note**: Update `client/src/apicalls/axiosInstance.js` baseURL to `http://localhost:5000` for local development.

### Building for Production

```bash
cd client
npx cross-env CI=false react-scripts build
```

---

## 📁 Project Structure

```
EDULIB/
├── client/                     # React frontend
│   ├── src/
│   │   ├── apicalls/           # API call functions
│   │   │   ├── books.js
│   │   │   ├── bookmarks.js    # NEW
│   │   │   ├── issues.js
│   │   │   ├── requests.js     # NEW
│   │   │   ├── reports.js
│   │   │   └── users.js
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Button.js
│   │   │   └── Loader.js
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── BookDescription/
│   │   │   └── Profile/
│   │   │       ├── BasicDetails/
│   │   │       ├── Books/          # BookForm, Issues, IssueForm
│   │   │       ├── BorrowedBooks/
│   │   │       ├── Bookmarks/      # NEW
│   │   │       ├── OverdueDashboard/# NEW
│   │   │       ├── PendingApprovals/# NEW
│   │   │       ├── ReadingHistory/  # NEW
│   │   │       ├── Reports/
│   │   │       ├── Requests/        # NEW
│   │   │       └── Users/           # BulkImportModal
│   │   ├── redux/
│   │   └── index.css            # Full design system
│   └── package.json
├── server/                      # Express backend
│   ├── config/
│   │   └── dbConfig.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── booksModel.js
│   │   ├── bookmarksModel.js    # NEW
│   │   ├── issuesModel.js
│   │   ├── requestsModel.js     # NEW
│   │   └── usersModel.js
│   ├── routes/
│   │   ├── booksRoute.js
│   │   ├── bookmarksRoute.js    # NEW
│   │   ├── issuesRoute.js
│   │   ├── reportsRoute.js
│   │   ├── requestsRoute.js     # NEW
│   │   └── usersRoute.js
│   ├── server.js
│   └── .env
└── vercel.json
```

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Student** | Browse books, borrow history, bookmarks, book requests |
| **Librarian** | Everything above + issue/return books, manage books, view overdue dashboard |
| **Admin** | Everything above + manage all users, approve signups, view reports, manage librarians |

> Default role on signup: `student` (status: `pending`, requires admin approval)

---

## 🔐 API Routes

### Users (`/api/users/`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email/roll number |
| GET | `/get-logged-in-user` | Get current user |
| GET | `/get-all-users/:role` | Get users by role |
| GET | `/get-user-by-id/:id` | Get user by ID |
| GET | `/find-user?query=` | Find by roll number or email |
| POST | `/bulk-import` | CSV bulk import students |
| GET | `/get-pending-users` | Get pending approvals |
| POST | `/update-user-status` | Approve/reject user |

### Issues (`/api/issues/`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/issue-new-book` | Issue a book |
| POST | `/get-issues` | Get issues (filterable) |
| POST | `/return-book` | Return book (calculates fine server-side) |
| POST | `/edit-issue` | Edit/renew issue |
| POST | `/delete-issue` | Delete issue |
| POST | `/mark-fine-paid` | Mark fine as paid |
| POST | `/mark-fine-waived` | Waive fine |
| GET | `/get-overdue` | Get all overdue books |
| GET | `/get-due-soon` | Get books due in 7 days |
| GET | `/get-stats` | Admin dashboard stats |

### Requests (`/api/requests/`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/add-request` | Student requests a book |
| GET | `/get-requests` | Get requests (role-aware) |
| POST | `/update-request-status` | Admin fulfills/rejects |
| POST | `/delete-request` | Cancel request |

### Bookmarks (`/api/bookmarks/`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/toggle-bookmark` | Toggle bookmark |
| GET | `/get-bookmarks` | Get user's bookmarks |
| GET | `/is-bookmarked/:bookId` | Check bookmark status |

---

## 🤝 Contributors

- **Vallabhaneni Sumanth**
- **Veeranki Phani Sirisha**

**Guided by:**
- **Dr. K Jyothsna Devi, Ph.D**
- **Mr. P. Anil Kumar, Ph.D**

---

## 📜 License

This project is licensed under the MIT License.
