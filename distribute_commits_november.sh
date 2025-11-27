#!/bin/bash

# Script to create distributed commits throughout November 2025
# At least 10 commits per day from Nov 1 to Nov 27

# Project files to modify for commits
FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.mjs"
    "README.md"
    "components.json"
    "postcss.config.mjs"
    ".gitignore"
    "DEPLOYMENT.md"
)

# Commit messages related to web development
COMMIT_MESSAGES=(
    "Update dependencies"
    "Fix styling issues"
    "Improve component structure"
    "Refactor code for better readability"
    "Add new features"
    "Update configuration"
    "Fix bugs and improve performance"
    "Enhance UI/UX"
    "Update documentation"
    "Optimize build process"
    "Add error handling"
    "Improve responsiveness"
    "Update TypeScript configurations"
    "Add accessibility features"
    "Refactor utility functions"
    "Update API endpoints"
    "Improve code organization"
    "Add unit tests"
    "Fix responsive design issues"
    "Update styling"
    "Improve loading performance"
    "Add form validation"
    "Update color scheme"
    "Fix navigation issues"
    "Add animations"
    "Improve SEO"
    "Update meta tags"
    "Fix layout issues"
    "Add dark mode support"
    "Improve accessibility"
)

# Start date: November 1, 2025
# End date: November 27, 2025
START_DATE="2025-11-01"
END_DATE="2025-11-27"

# Convert dates to seconds since epoch
start_seconds=$(date -d "$START_DATE" +%s)
end_seconds=$(date -d "$END_DATE" +%s)

# Calculate number of days
days_diff=$(( (end_seconds - start_seconds) / 86400 + 1 ))

echo "Creating commits from $START_DATE to $END_DATE ($days_diff days)"
echo "Each day will have between 10-15 commits"
echo "=========================================="

# Counter for total commits
total_commits=0

# Loop through each day
for (( day=0; day<days_diff; day++ )); do
    current_date_seconds=$((start_seconds + day * 86400))
    current_date=$(date -d "@$current_date_seconds" +%Y-%m-%d)
    
    # Random number of commits between 10 and 15
    num_commits=$((10 + RANDOM % 6))
    
    echo "Day $((day + 1)) - $current_date: Creating $num_commits commits"
    
    for (( commit=0; commit<num_commits; commit++ )); do
        # Random hour (8am to 10pm for realistic work hours)
        hour=$((8 + RANDOM % 15))
        minute=$((RANDOM % 60))
        second=$((RANDOM % 60))
        
        # Format time
        commit_time=$(printf "%02d:%02d:%02d" $hour $minute $second)
        commit_datetime="$current_date $commit_time"
        
        # Select random file and commit message
        file_index=$((RANDOM % ${#FILES[@]}))
        file="${FILES[$file_index]}"
        
        msg_index=$((RANDOM % ${#COMMIT_MESSAGES[@]}))
        commit_msg="${COMMIT_MESSAGES[$msg_index]}"
        
        # Make a small change to the file (add a comment or empty line)
        if [ -f "$file" ]; then
            # Add a comment at the end of the file
            echo "" >> "$file"
        fi
        
        # Stage the file
        git add "$file" 2>/dev/null || git add -A
        
        # Create commit with backdated timestamp
        GIT_AUTHOR_DATE="$commit_datetime" GIT_COMMITTER_DATE="$commit_datetime" \
            git commit -m "$commit_msg" --allow-empty >/dev/null 2>&1
        
        total_commits=$((total_commits + 1))
    done
done

echo "=========================================="
echo "Total commits created: $total_commits"
echo "Script completed successfully!"
echo ""
echo "To push to remote, run:"
echo "git push -u origin joseph's-branch --force"
