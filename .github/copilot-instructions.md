# GitHub Copilot Instructions for ronPortfolio

## Project Overview
This is a personal portfolio website for Ron, designed as a linktree-style landing page with an interactive CV timeline. The site showcases Ron's professional journey, achievements, education, and personal projects.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+)
- **No Build Process**: Static files served directly
- **No Frameworks**: Pure vanilla JavaScript for simplicity and performance

## File Structure
```
/
├── index.html          # Main landing page with profile and links
├── cv.html            # CV page with interactive timeline
├── contact.html       # Contact information page
├── styles.css         # Global styles with CSS variables
├── js/
│   └── cv.js         # JavaScript for CV timeline parsing and rendering
├── img/              # Image assets
└── milestones.md     # Markdown file containing CV data
```

## Coding Standards

### HTML
- Use semantic HTML5 elements
- Include proper meta tags for viewport and charset
- Maintain accessibility with proper alt text and ARIA labels where appropriate
- Keep HTML clean and readable with consistent indentation

### CSS
- Use CSS custom properties (variables) defined in `:root` for theming
- Follow existing color scheme variables:
  - `--primary-color`, `--secondary-color`, `--accent-color`
  - Category colors: `--education-color`, `--work-color`, `--achievement-color`, `--personal-color`
- Use BEM-like naming or descriptive class names
- Maintain mobile-first responsive design
- Keep styles organized by component/section

### JavaScript
- Use modern ES6+ syntax (async/await, arrow functions, const/let)
- Write vanilla JavaScript - no frameworks or libraries
- Handle errors gracefully with try-catch blocks
- Use async/await for fetch operations
- Keep code modular with clear function purposes
- Add comments for complex logic

## Data Format
The `milestones.md` file uses a specific markdown format:
```markdown
# Category : [category-name]

## [Milestone Title]
- Time period : [period]
- Bullet points
  - [point 1]
  - [point 2]
- icon : [emoji or URL]
- Logo : [URL] (optional)
```

Categories: `personal`, `education`, `work`, `achievement`

## Guidelines for Changes

### When Adding Features
1. Maintain the minimal, clean aesthetic
2. Ensure mobile responsiveness
3. Test in different browsers if adding new features
4. Keep JavaScript vanilla - don't introduce dependencies
5. Follow the existing color scheme

### When Modifying Styles
1. Use existing CSS variables where possible
2. Test changes on all pages (index, cv, contact)
3. Maintain consistent spacing and typography
4. Preserve accessibility features

### When Updating Content
1. For CV updates, modify `milestones.md` following the established format
2. For link updates, modify the relevant HTML files
3. Ensure all links open external sites with `target="_blank" rel="noopener"`

### When Fixing Bugs
1. Test the fix on all three HTML pages
2. Ensure backward compatibility with existing data in `milestones.md`
3. Maintain error handling in JavaScript

## Performance Considerations
- Keep the site lightweight and fast-loading
- Optimize images before adding them
- Minimize HTTP requests
- Avoid adding external dependencies unless absolutely necessary

## Browser Compatibility
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Use features with good browser support (ES6+ is fine)
- Test responsive design on mobile devices

## Common Tasks

### Adding a New Milestone
Edit `milestones.md` and add the milestone under the appropriate category following the format above.

### Adding a New Link to Landing Page
Edit `index.html` and add a new `.link-card` element in the `.links-container`.

### Changing Theme Colors
Modify CSS variables in `:root` selector in `styles.css`.

### Updating Profile Information
Edit the header section in `index.html`.

## Notes
- This is a personal portfolio, so maintain a professional yet personable tone
- The site owner (Ron) is passionate about open-source, culture, and AI in the physical world
- Keep the design simple and focused on content over flashy effects
