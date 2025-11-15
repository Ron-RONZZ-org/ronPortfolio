// Fetch and parse milestones.md
async function loadMilestones() {
    try {
        const response = await fetch('milestones.md');
        const markdown = await response.text();
        const milestones = parseMarkdown(markdown);
        renderTimeline(milestones);
        setupFilters();
    } catch (error) {
        console.error('Error loading milestones:', error);
        document.getElementById('timeline').innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load timeline data.</p>';
    }
}

// Parse markdown content into structured data
function parseMarkdown(markdown) {
    const lines = markdown.split('\n');
    const milestones = [];
    let currentCategory = null;
    let currentMilestone = null;
    let parsingBulletPoints = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse category
        if (line.startsWith('# Category :')) {
            currentCategory = line.split(':')[1].trim();
            continue;
        }

        // Parse title (## heading)
        if (line.startsWith('## ')) {
            // Save previous milestone if exists
            if (currentMilestone) {
                milestones.push(currentMilestone);
            }
            // Start new milestone
            currentMilestone = {
                category: currentCategory,
                title: line.substring(3).trim(),
                timePeriod: '',
                bulletPoints: [],
                icon: ''
            };
            parsingBulletPoints = false;
            continue;
        }

        if (!currentMilestone) continue;

        // Parse time period
        if (line.startsWith('- Time period :')) {
            currentMilestone.timePeriod = line.split(':')[1].trim();
            continue;
        }

        // Start bullet points section
        if (line === '- Bullet points') {
            parsingBulletPoints = true;
            continue;
        }

        // Parse icon
        if (line.startsWith('- icon :')) {
            currentMilestone.icon = line.split(':')[1].trim();
            parsingBulletPoints = false;
            continue;
        }

        // Parse bullet points
        if (parsingBulletPoints && line.startsWith('- ')) {
            currentMilestone.bulletPoints.push(line.substring(2).trim());
        }
    }

    // Add last milestone
    if (currentMilestone) {
        milestones.push(currentMilestone);
    }

    // Sort milestones chronologically (most recent first)
    return sortMilestones(milestones);
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

// Sort milestones by time period (most recent first)
function sortMilestones(milestones) {
    return milestones.sort((a, b) => {
        return parseTimePeriod(b.timePeriod) - parseTimePeriod(a.timePeriod);
    });
}

// Render timeline with milestones
function renderTimeline(milestones) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    milestones.forEach(milestone => {
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
        title.textContent = milestone.title;
        if (milestone.icon) {
            title.textContent = `${milestone.icon} ${milestone.title}`;
        }

        const detailsList = document.createElement('ul');
        detailsList.className = 'milestone-details';
        milestone.bulletPoints.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            detailsList.appendChild(li);
        });

        content.appendChild(time);
        content.appendChild(title);
        content.appendChild(detailsList);

        milestoneDiv.appendChild(marker);
        milestoneDiv.appendChild(content);

        timeline.appendChild(milestoneDiv);
    });
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const milestones = document.querySelectorAll('.milestone');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Get filter value
            const filter = button.getAttribute('data-filter');

            // Filter milestones
            milestones.forEach(milestone => {
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

// Load milestones when page loads
document.addEventListener('DOMContentLoaded', loadMilestones);
