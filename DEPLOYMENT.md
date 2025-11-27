# Netlify Deployment Guide for UniGuard Wallet

## 🚀 Quick Deployment Steps

### 1. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `MukamaJ-2/uniguard-wallet` repository
5. Configure build settings (already set in `netlify.toml`)

### 2. Build Settings (Auto-configured)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18

### 3. Environment Variables (Optional)
Add these in Netlify Dashboard > Site Settings > Environment Variables:
```
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=UniGuard Wallet
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

### 4. Deploy
- Click "Deploy site"
- Netlify will automatically build and deploy your app
- Your site will be available at `https://your-site-name.netlify.app`

## 📁 Files Added for Deployment

### `netlify.toml`
- Build configuration
- Redirect rules for SPA routing
- Security headers
- Cache optimization

### `public/_redirects`
- Client-side routing support
- Static asset handling

### `env.example`
- Environment variables template
- Copy to `.env.local` for local development

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Export static files:**
   ```bash
   npm run export
   ```

3. **Upload to Netlify:**
   - Drag and drop the `out` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=out`

## 🌐 Custom Domain (Optional)

1. Go to Site Settings > Domain Management
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

## 📊 Performance Optimization

The deployment includes:
- ✅ Static asset caching
- ✅ Security headers
- ✅ SPA routing support
- ✅ Image optimization
- ✅ Build optimization

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run type-check`

### Routing Issues
- Ensure `_redirects` file is in `public/` folder
- Check `netlify.toml` redirect rules

### Environment Variables
- Add variables in Netlify dashboard
- Restart deployment after adding variables

## 📱 Features Included

- ✅ Responsive design (mobile + desktop)
- ✅ Dark/Light theme toggle
- ✅ Progressive Web App ready
- ✅ SEO optimized
- ✅ Analytics ready
- ✅ Modern UI with animations

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback to previous versions anytime

---

**Your UniGuard Wallet app is now ready for production deployment! 🎉**
