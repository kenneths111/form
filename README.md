# Trip Form App

A modern, Google Forms-like web application for collecting participant responses for trips. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 📝 **Form Builder** - Create custom forms with various question types
- 📊 **Response Collection** - Collect and view participant responses
- 💾 **Data Export** - Download responses as CSV
- 🚀 **Easy Deployment** - Ready to deploy on Vercel

## Question Types Supported

- Short Text
- Long Text
- Multiple Choice
- Checkboxes
- Dropdown
- Email
- Phone
- Date

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
form/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create/            # Form creation page
│   ├── forms/             # Forms list page
│   ├── f/[id]/            # Form submission page
│   ├── responses/         # Responses viewing pages
│   └── page.tsx           # Home page
├── lib/                   # Utility functions and types
│   ├── types.ts          # TypeScript type definitions
│   └── storage.ts        # File-based storage utilities
├── data/                  # JSON data storage (created automatically)
└── public/               # Static assets
```

## Deployment to Vercel

### Quick Deploy

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Visit [vercel.com](https://vercel.com) and sign up/log in

3. Click "New Project" and import your repository

4. Vercel will automatically detect Next.js and configure the build settings

5. Click "Deploy" and wait for the deployment to complete

### Using Vercel CLI

Alternatively, deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts to complete the deployment.

## Data Storage

The app uses file-based JSON storage for simplicity. Data is stored in:
- `data/forms.json` - Form definitions
- `data/responses.json` - Form responses

**Note**: For production use with high traffic, consider migrating to a proper database solution like:
- PostgreSQL
- MongoDB
- Supabase
- PlanetScale

## Usage

### Creating a Form

1. Click "Create Form" from the home page
2. Enter a form title and description
3. Add questions by clicking "Add Question"
4. Configure question types, options, and requirements
5. Click "Create Form" to save

### Sharing a Form

1. Go to "My Forms"
2. Click the copy icon to copy the form link
3. Share the link with participants

### Viewing Responses

1. Go to "View Responses"
2. Select a form to view its responses
3. Download responses as CSV if needed

## Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: {
    // Your color palette
  }
}
```

### Adding Question Types

1. Add new type to `QuestionType` in `lib/types.ts`
2. Update form creator in `app/create/page.tsx`
3. Add rendering logic in `app/f/[id]/page.tsx`

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Nanoid** - Unique ID generation

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

