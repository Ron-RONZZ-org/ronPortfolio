// Fetch and parse mileStone.md
async function loadMilestones() {
    try {
        const response = await fetch('mileStone.md');
        const markdown = await response.text();
        const mileStone = parseMarkdown(markdown);
        renderTimeline(mileStone);
        setupFilters();
    } catch (error) {
        console.error('Error loading mileStone:', error);
        document.getElementById('timeline').innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load timeline data.</p>';
    }
}

// Parse markdown content into structured data
function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    const mileStone = [];
    let currentCategory = null;
    let currentMilestone = null;
    let parsingBulletPoints = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Parse category
        if (trimmedLine.startsWith('# Category :')) {
            currentCategory = trimmedLine.split(':')[1].trim();
            continue;
        }

        // Parse title (## heading)
        if (trimmedLine.startsWith('## ')) {
            // Save previous milestone if exists
            if (currentMilestone) {
                mileStone.push(currentMilestone);
            }
            // Start new milestone
            currentMilestone = {
                category: currentCategory,
                title: trimmedLine.substring(3).trim(),
                timePeriod: '',
                bulletPoints: [],
                icon: '',
                logo: ''
            };
            parsingBulletPoints = false;
            continue;
        }

        if (!currentMilestone) continue;

        // Parse time period
        if (trimmedLine.toLowerCase().startsWith('- time period :')) {
            currentMilestone.timePeriod = trimmedLine.split(':')[1].trim();
            continue;
        }

        // Start bullet points section
        if (trimmedLine.toLowerCase() === '- bullet points') {
            parsingBulletPoints = true;
            continue;
        }

        // Parse icon (case insensitive)
        if (trimmedLine.toLowerCase().startsWith('- icon :')) {
            currentMilestone.icon = trimmedLine.split(':')[1].trim();
            parsingBulletPoints = false;
            continue;
        }

        // Parse logo (case insensitive)
        if (trimmedLine.toLowerCase().startsWith('- logo :')) {
            currentMilestone.logo = trimmedLine.split(':').slice(1).join(':').trim();
            parsingBulletPoints = false;
            continue;
        }

        // Parse bullet points (including multi-level)
        if (parsingBulletPoints && trimmedLine.startsWith('- ')) {
            // Calculate indentation level (count leading spaces before the dash)
            const leadingSpaces = line.search(/\S/);
            const indentLevel = Math.floor(leadingSpaces / 2); // Assuming 2 spaces per indent level
            
            currentMilestone.bulletPoints.push({
                text: trimmedLine.substring(2).trim(),
                level: indentLevel
            });
        }
    }

    // Add last milestone
    if (currentMilestone) {
        mileStone.push(currentMilestone);
    }

    // Sort mileStone chronologically (most recent first)
    return sortMilestones(mileStone);
}

// Parse time period and create sortable date
function parseTimePeriod(timePeriod) {
    // Handle "Present"
    if (timePeriod.toLowerCase().includes('present')) {
        return new Date().getTime();
    }

    // Extract end date (or single date) - split on " - " to handle ranges
    const parts = timePeriod.split(' - ');
    let dateStr = parts[parts.length - 1].trim();

    // Parse YYYY or YYYY-MM format
    const dateMatch = dateStr.match(/(\d{4})(?:-(\d{2}))?/);
    if (dateMatch) {
        const year = parseInt(dateMatch[1]);
        const month = dateMatch[2] ? parseInt(dateMatch[2]) - 1 : 0;
        return new Date(year, month).getTime();
    }

    return 0;
}

// Sort mileStone by time period (most recent first)
function sortMilestones(mileStone) {
    return mileStone.sort((a, b) => {
        return parseTimePeriod(b.timePeriod) - parseTimePeriod(a.timePeriod);
    });
}

// Parse markdown-style links [text](url) and HTML links <a href="url">text</a> to HTML
function parseLinks(text) {
    // First, handle HTML anchor tags: <a href="url">text</a>
    text = text.replace(/<a\s+href="([^"]+)">([^<]+)<\/a>/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');
    
    // Then, handle markdown-style links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    return text;
}

// Get default icon for category
function getDefaultIcon(category) {
    const defaultIcons = {
        'work': '💼',
        'education': '🎓',
        'achievement': '🥇',
        'personal': '🎉'
    };
    return defaultIcons[category] || '';
}

// Render timeline with mileStone
function renderTimeline(mileStone) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    mileStone.forEach(milestone => {
        const milestoneDiv = document.createElement('div');
        milestoneDiv.className = `milestone ${milestone.category}`;
        milestoneDiv.setAttribute('data-category', milestone.category);

        const marker = document.createElement('div');
        marker.className = 'milestone-marker';

        const content = document.createElement('div');
        content.className = 'milestone-content';

        const time = document.createElement('div');
        time.className = 'milestone-time';
        time.textContent = milestone.timePeriod;

        const title = document.createElement('h3');
        title.className = 'milestone-title';
        // Parse links in title
        const parsedTitle = parseLinks(milestone.title);
        // Use provided icon or default icon based on category
        const icon = milestone.icon || getDefaultIcon(milestone.category);
        if (icon) {
            title.innerHTML = `${icon} ${parsedTitle}`;
        } else {
            title.innerHTML = parsedTitle;
        }

        const detailsList = document.createElement('ul');
        detailsList.className = 'milestone-details';
        
        // Render bullet points with proper nesting
        renderBulletPoints(milestone.bulletPoints, detailsList);

        content.appendChild(time);
        content.appendChild(title);
        if (milestone.bulletPoints.length > 0) {
            content.appendChild(detailsList);
        }

        // Add logo if present
        if (milestone.logo) {
            const logoImg = document.createElement('img');
            logoImg.className = 'milestone-logo';
            logoImg.src = milestone.logo;
            logoImg.alt = 'Logo';
            logoImg.onerror = function() {
                // Hide image if it fails to load
                this.style.display = 'none';
            };
            content.appendChild(logoImg);
        }

        milestoneDiv.appendChild(marker);
        milestoneDiv.appendChild(content);

        timeline.appendChild(milestoneDiv);
    });
}

// Render bullet points with proper nesting
function renderBulletPoints(bulletPoints, parentElement) {
    if (!bulletPoints || bulletPoints.length === 0) return;
    
    // Normalize levels - find minimum level and subtract it from all
    let minLevel = Infinity;
    bulletPoints.forEach(point => {
        const level = point.level !== undefined ? point.level : 0;
        minLevel = Math.min(minLevel, level);
    });
    
    const normalizedPoints = bulletPoints.map(point => ({
        text: point.text || point,
        level: (point.level !== undefined ? point.level : 0) - minLevel
    }));
    
    // Build nested list
    buildNestedList(normalizedPoints, parentElement, 0, 0);
}

// Helper function to build nested lists recursively
function buildNestedList(points, parentElement, startIndex, currentLevel) {
    let i = startIndex;
    
    while (i < points.length) {
        const point = points[i];
        
        if (point.level < currentLevel) {
            // Return to parent level
            return i;
        }
        
        if (point.level === currentLevel) {
            // Create list item at current level
            const li = document.createElement('li');
            li.innerHTML = parseLinks(point.text);
            parentElement.appendChild(li);
            
            // Check if next item is a child (deeper level)
            if (i + 1 < points.length && points[i + 1].level > currentLevel) {
                // Create nested ul
                const nestedUl = document.createElement('ul');
                li.appendChild(nestedUl);
                // Recursively build nested list
                i = buildNestedList(points, nestedUl, i + 1, currentLevel + 1);
                continue;
            }
        }
        
        i++;
    }
    
    return i;
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const mileStone = document.querySelectorAll('.milestone');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Get filter value
            const filter = button.getAttribute('data-filter');

            // Filter mileStone
            mileStone.forEach(milestone => {
                if (filter === 'all') {
                    milestone.classList.remove('hidden');
                } else {
                    const category = milestone.getAttribute('data-category');
                    if (category === filter) {
                        milestone.classList.remove('hidden');
                    } else {
                        milestone.classList.add('hidden');
                    }
                }
            });
        });
    });
}

// Load mileStone when page loads
document.addEventListener('DOMContentLoaded', loadMilestones);
