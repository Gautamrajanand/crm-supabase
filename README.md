# CRM System with Next.js and Supabase

A modern CRM (Customer Relationship Management) system built with Next.js 14, Supabase, and Tailwind CSS. Features include customer management, calendar scheduling, analytics, and team collaboration.

## Features

- 🔐 **Authentication** - Secure login with Supabase Auth
- 👥 **Customer Management** - Track and manage customer information
- 📅 **Calendar Integration** - Schedule and manage appointments with FullCalendar
- 📊 **Analytics Dashboard** - Visual insights with Recharts
- 👥 **Team Management** - Manage team members and roles
- 📋 **Project Tracking** - Monitor project status and progress
- 🎯 **Task Management** - Assign and track tasks

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Calendar**: FullCalendar
- **Icons**: Heroicons

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gautamrajanand/crm-supabase.git
   cd crm-supabase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Use the demo credentials to log in:
     - Email: demo@example.com
     - Password: demo123

## Project Structure

```
crm-supabase/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── customers/        # Customer management
│   └── layout/           # Layout components
├── utils/                # Utility functions
├── lib/                  # Library code
└── supabase/            # Database migrations
```

## Database Schema

The application uses the following main tables in Supabase:
- `users` - User accounts and profiles
- `customers` - Customer information
- `projects` - Project details
- `tasks` - Task management
- `events` - Calendar events

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For support, email your questions or open an issue in the GitHub repository.
