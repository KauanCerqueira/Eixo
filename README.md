# Eixo - Family Life Manager

A complete family management application with React Native (Expo) frontend and .NET 8 Web API backend.

## 📁 Project Structure

```
Eixo/
├── frontend/          # React Native Expo App
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── context/
│   │   ├── types/
│   │   └── navigation/
│   ├── App.tsx
│   └── package.json
│
├── backend/           # .NET 8 Web API
│   ├── Eixo.Api/      # Controllers & API Configuration
│   ├── Eixo.Core/     # Domain Entities
│   ├── Eixo.Infrastructure/  # EF Core & SQLite
│   └── Eixo.slnx
│
└── README.md
```

## 🚀 Getting Started

### Backend (API)

```bash
cd backend
dotnet run --project Eixo.Api
```

The API will start at:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001
- **Swagger**: http://localhost:5000/swagger

### Frontend (Mobile App)

```bash
cd frontend
npm install
npx expo start
```

## 🛠 Technology Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core 8
- SQLite Database
- Swagger/OpenAPI

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- Lucide Icons

## 📡 API Endpoints

### Users
- `GET /api/users` - List all family members
- `GET /api/users/{id}` - Get user details
- `GET /api/users/leaderboard` - Gamification leaderboard
- `GET /api/users/{id}/settings` - Get user settings
- `PUT /api/users/{id}/settings` - Update user settings

### Tasks (NÓS Mode)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Complete task (awards points)

### Finance
- `GET/POST/DELETE /api/expenses` - Expense management
- `GET/POST/DELETE /api/incomes` - Income management
- `GET/POST/DELETE /api/debts` - Debt tracking
- `POST /api/debts/{id}/pay` - Pay debt installment
- `GET/POST/DELETE /api/subscriptions` - Subscriptions
- `GET/POST/DELETE /api/goals` - Goals
- `POST /api/goals/{id}/contribute` - Add contribution

### Shopping & Events
- `GET/POST/DELETE /api/shopping` - Shopping list
- `PUT /api/shopping/{id}/toggle` - Toggle bought status
- `GET/POST/DELETE /api/events` - Calendar events
- `GET/POST/DELETE /api/notifications` - Notifications
- `GET/POST/DELETE /api/notices` - Family bulletin board

### Rewards (Gamification)
- `GET /api/rewards` - List available rewards
- `POST /api/rewards/{id}/redeem` - Redeem reward (deducts points)
- `GET /api/rewards/history/{userId}` - Redemption history

### Personal/EU Mode
- `GET/POST/DELETE /api/personal/transactions` - Personal finance
- `GET/POST/DELETE /api/personal/habits` - Habit tracking
- `PUT /api/personal/habits/{id}/increment` - Increment habit
- `GET/POST/DELETE /api/personal/hobbies` - Hobbies
- `GET/POST/DELETE /api/personal/wishlist` - Personal wishlist
- `GET/POST /api/personal/workouts` - Workout logs
- `GET/POST /api/personal/meals` - Meal/nutrition tracking
- `GET/POST /api/personal/study` - Study sessions
- `GET/POST /api/personal/cycle` - Cycle tracking

## 💾 Database

SQLite database (`eixo.db`) is created automatically on first run.

### Seeded Data
- 3 Users: Ana, João, Maria
- 4 Rewards: Folga da Louça, Escolher Jantar, Vale Cinema, Manhã de Domingo
- 3 Subscriptions: Netflix, Internet Fibra, Spotify

## 🔄 Next Steps

1. **Frontend Integration**: Connect React Native app to the API
2. **Authentication**: Add JWT authentication
3. **Real-time Updates**: Add SignalR for live notifications
4. **Offline Support**: Implement local caching with sync

## 📜 License

Private family project.
