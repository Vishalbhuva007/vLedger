# vLedger Admin Panel

A modern React-based admin panel for the vLedger accounting system.

## Features

- **Dashboard**: Overview of accounts, transactions, and financial summaries
- **Account Management**: Create, view, and manage chart of accounts
- **Transaction Processing**: Create and manage double-entry transactions
- **Financial Reports**: Trial balance, general ledger, and visual analytics
- **Real-time Data**: Live updates from the ledger API
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 18+
- The vLedger API server running on port 3000

### Installation

1. **Install dependencies**:
   ```bash
   npm run admin:install
   ```

2. **Start the development server**:
   ```bash
   npm run admin:dev
   ```

   The admin panel will be available at `http://localhost:3001`

### Building for Production

```bash
npm run admin:build
```

## Usage

### Dashboard
- View account summaries and recent transactions
- Monitor total assets, liabilities, and equity
- Quick overview of system health

### Accounts Management
- Create new accounts with proper account codes
- View account balances in real-time
- Manage account types (Asset, Liability, Equity, Revenue, Expense)
- Filter and search accounts

### Transaction Processing
- Create double-entry transactions with multiple journal entries
- Automatic validation that debits equal credits
- Post or cancel pending transactions
- View detailed transaction history

### Reports & Analytics
- **Trial Balance**: Complete trial balance with balance verification
- **General Ledger**: Detailed journal entries with filtering
- **Charts & Analytics**: Visual representation of account distributions

## API Integration

The admin panel communicates with the vLedger API server through:
- RESTful API calls via Axios
- Automatic proxy configuration in development
- CORS-enabled requests for cross-origin communication

## Development

### Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main page components
│   ├── services/      # API service layers
│   ├── types/         # TypeScript type definitions
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── dist/             # Built application
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built application
- `npm run lint` - Run ESLint

## Customization

### Styling
The admin panel uses Tailwind CSS with a custom design system. Key colors and components can be customized in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Custom CSS classes

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add API endpoints in `src/services/api.ts`

## Production Deployment

The admin panel can be deployed as a static site:

1. Build the application: `npm run admin:build`
2. Deploy the `admin/dist/` folder to your web server
3. Configure your web server to proxy API requests to the vLedger backend
4. Set up proper CORS headers on the API server

## Security Considerations

- The admin panel currently has no authentication built-in
- In production, implement proper authentication and authorization
- Use HTTPS for all communications
- Implement proper session management
- Add input validation and sanitization
