# ronPortfolio
Rong's personal portfolio linktree

## Live Site
Visit the portfolio at: [rongzhou.me](https://rongzhou.me)

## Deployment
This site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Setup Instructions
1. **DNS Configuration**: Ensure your domain (rongzhou.me) has the following DNS records:
   - `A` record pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or `CNAME` record pointing to: `ron-ronzz-org.github.io`

2. **GitHub Pages Settings**:
   - Go to repository Settings > Pages
   - Source should be set to "GitHub Actions"
   - Custom domain should be set to `rongzhou.me`

3. **Automatic Deployment**: 
   - The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles deployment automatically
   - Any push to the `main` branch triggers a new deployment
   - Manual deployment can be triggered from the Actions tab

## Local Development
Simply open `index.html` in a web browser. No build process is required.

## Project Structure
- `index.html` - Main landing page
- `cv.html` - CV page with timeline
- `contact.html` - Contact information
- `styles.css` - Global styles
- `js/cv.js` - CV timeline parser
- `mileStone.md` - CV data in markdown format
- `img/` - Image assets
