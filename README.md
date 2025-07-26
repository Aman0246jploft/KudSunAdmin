# Kudsun Frontend

A modern React application for the Kudsun platform with comprehensive user management, product listings, auction functionality, and more.

## Features

### User Management
- **User Profiles**: Comprehensive user information display with seller verification status
- **UserInfo Page**: Detailed user information page showing:
  - User basic information with verified seller and preferred seller status
  - Activity statistics (products, threads, reviews, followers/following)
  - Tabbed interface for viewing:
    - Overview: User details, activity summary, social stats
    - Products: User's listed products with filtering and pagination
    - Threads: User's created threads with associated product counts
    - Transactions: User's purchase history with detailed filtering
    - Reviews: User's product reviews with ratings

### Product Management
- Product listings with auction and fixed-price support
- Image upload and management
- Category and subcategory organization
- Product search and filtering

### Communication
- Real-time chat functionality
- Thread-based discussions
- Comment system

### Admin Features
- Transaction management and monitoring
- Financial dashboard with dispute integration
- Review management system
- User verification management

## Key Pages

### UserInfo Page (`/user/:id`)
Displays comprehensive user information including:
- **Seller Status**: Shows if user is verified seller or preferred seller
- **Statistics**: Total counts of products, threads, reviews, followers
- **Product Listings**: Paginated view of user's products with images and status
- **Transaction History**: Detailed transaction list with filtering by status, payment, date range, and amount
- **Reviews**: User's product reviews with ratings
- **Thread Activity**: User's created threads with associated product information

#### UserInfo Features:
- **Responsive Design**: Works on mobile and desktop
- **Filtering**: Advanced filters for transactions (status, payment, date range, amount)
- **Pagination**: Efficient data loading with pagination for all lists
- **Real-time Data**: Live updates from backend APIs
- **Theme Support**: Follows application theme settings

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## API Integration

The application integrates with backend APIs for:
- User profile information (`/user/getOtherProfile/:id`)
- Product listings (`/product/fetchUserProducts`)
- Thread management (`/thread/getThreadByUserId`)
- Transaction history (`/order/getBoughtProduct`)
- Review system (`/review/user-reviews`)

## Theme Support

The application supports multiple themes through the theme context:
- Light theme
- Dark theme  
- Green theme
- Purple theme
- Blue theme

## Technology Stack

- **React 18**: Modern React with hooks and suspense
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Comprehensive icon library
- **Axios**: HTTP client for API calls
- **React Toastify**: Toast notifications

## Project Structure

```
src/
├── Pages/
│   ├── UserInfo/           # User information page
│   ├── Admin/              # Admin management pages
│   ├── Auth/               # Authentication pages
│   └── ...
├── Component/
│   ├── Table/              # Reusable data table component
│   ├── Atoms/              # Basic UI components (Button, Input, etc.)
│   └── ...
├── contexts/
│   └── theme/              # Theme management
├── api/                    # API client configuration
└── routes/                 # Route protection and navigation
```

## Usage Examples

### Viewing User Information
Navigate to `/user/:id` where `:id` is the user's ID to view comprehensive user information.

### Accessing Admin Features
Admin users can access transaction management at `/admin/transactions` and financial dashboard at `/admin/financial-dashboard`.

### Product Management
Users can manage their products through `/sellProduct` and `/auctionProduct` pages.

## Development Guidelines

- Follow React hooks best practices
- Use the theme context for consistent styling
- Implement proper error handling with toast notifications
- Follow the established component structure for new features
- Use TypeScript for better code quality (when available)

## Contributing

1. Follow the existing code style and structure
2. Test new features thoroughly
3. Update documentation for new components
4. Follow React and JavaScript best practices
