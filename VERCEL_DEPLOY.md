# Deploying to Vercel

This guide will help you deploy your Trip Form app to Vercel.

## Prerequisites

- A Vercel account (free at [vercel.com](https://vercel.com))
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to Git

If you haven't already, initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your repository from the list
5. Vercel will auto-detect Next.js settings - no configuration needed!
6. Click **"Deploy"**

### Step 3: Wait for Deployment

Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production

This usually takes 1-2 minutes.

### Step 4: Access Your App

Once deployed, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

Navigate to your project directory and run:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N (for first deploy)
- **Project name?** Press enter or type a name
- **Directory?** Press enter (uses current directory)

### Step 4: Deploy to Production

For subsequent deployments:

```bash
vercel --prod
```

## Important Notes for Production

### Data Persistence

⚠️ **Important**: The current app uses local file storage (`data/` folder), which is **ephemeral on Vercel**. Files will be lost on each deployment.

For production, you should migrate to a persistent database:

#### Recommended Options:

1. **Vercel Postgres** (Easiest)
   - Built-in integration
   - [Guide](https://vercel.com/docs/storage/vercel-postgres)

2. **Supabase** (Good free tier)
   - PostgreSQL with real-time features
   - [supabase.com](https://supabase.com)

3. **MongoDB Atlas** (NoSQL option)
   - Free tier available
   - [mongodb.com/atlas](https://www.mongodb.com/atlas)

4. **PlanetScale** (MySQL)
   - Serverless MySQL
   - [planetscale.com](https://planetscale.com)

### To Add Database Support:

1. Choose a database provider
2. Update `lib/storage.ts` to use database instead of files
3. Add database connection string to Vercel environment variables
4. Redeploy

## Environment Variables

If you add environment variables (like database URLs):

### Via Dashboard:
1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add your variables
4. Redeploy

### Via CLI:
```bash
vercel env add DATABASE_URL production
```

## Custom Domain

To add a custom domain:

1. Go to your project on Vercel
2. Click **Settings** → **Domains**
3. Add your domain
4. Update your DNS records as instructed

## Continuous Deployment

Once connected to Git, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Provides instant rollback capabilities

## Monitoring

Access your deployment logs:
- Dashboard: Project → Deployments → Click deployment → View logs
- CLI: `vercel logs URL`

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test locally with `npm run build`

### API Routes Not Working
- Ensure your API routes are in `app/api/` directory
- Check that routes export proper HTTP methods (GET, POST, etc.)

### Forms/Data Not Saving
- Remember: file storage is ephemeral on Vercel
- Implement a database solution for production

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

For app-specific issues:
- Check the main README.md
- Review the code in your repository

