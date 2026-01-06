# How To Setup

## Backend

### Technologies

- **Express.js** - Web framework
- **Sequelize** - ORM
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── constants/      # Application-wide fixed values
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validators/     # Request validation schemas
├── migrations/         # Database migrations
├── seeders/            # Database seeders
└── server.js           # Entry point
```

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mini-ecommerce-app/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with **your own database credentials and JWT secret**:

```env
# JWT Configuration
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mini_ecommerce_local
DB_USER=your_mysql_username      # ← Change this
DB_PASSWORD=your_mysql_password  # ← Change this
```

> **Use this command in Terminal to generate JWT_SECRET**:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Create MySQL Database

```bash
mysql -u your_username -p
CREATE DATABASE mini_ecommerce_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Or create it via **MySQL Workbench/Navicat** with:

- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

### 5. Run Migrations

```bash
npx sequelize-cli db:migrate
```

### 6. Seed Database

```bash
npx sequelize-cli db:seed:all
```

### 7. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

### 📝 Available Scripts

- `npm start` - Run in production mode
- `npm run dev` - Run in development mode with auto-reload
- `npx sequelize-cli db:migrate` - Run migrations
- `npx sequelize-cli db:seed:all` - Run all seeders
- `npx sequelize-cli db:migrate:undo` - Undo last migration
- `npx sequelize-cli db:seed:undo:all` - Undo all seeders

---

## Frontend

### Technologies

- **React** - UI library
- **Vite** - Build tool and dev server
- **Ant Design** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization

### Project Structure

```
frontend/
├── src/
│   ├── api/            # API client functions
│   ├── components/     # Reusable React components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── login/      # Authentication pages
│   │   └── user/       # User pages
│   ├── constants/      # Application constants
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── vite.config.js      # Vite configuration
```

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with your backend API URL if needed:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

---

### 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
