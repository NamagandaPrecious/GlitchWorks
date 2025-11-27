#!/bin/bash

# Script to ensure all days from Nov 1-27, 2025 have at least 10 commits
# Days that need more commits: Nov 6 (10), Nov 7 (10), Nov 21 (10)

cd /home/mukama/Desktop/project

# Function to create a commit with a specific date
create_commit() {
    local date=$1
    local hour=$2
    local minute=$3
    local commit_num=$4
    
    # Add a small change to commit_log.txt
    echo "Commit entry ${date}T${hour}:${minute}:00 - ${commit_num}" >> commit_log.txt
    
    # Set GIT_AUTHOR_DATE and GIT_COMMITTER_DATE
    export GIT_AUTHOR_DATE="${date} ${hour}:${minute}:00 +0300"
    export GIT_COMMITTER_DATE="${date} ${hour}:${minute}:00 +0300"
    
    # Stage and commit
    git add commit_log.txt
    git commit -m "Update log ${date} - ${commit_num}" --date="${date} ${hour}:${minute}:00 +0300"
    
    unset GIT_AUTHOR_DATE
    unset GIT_COMMITTER_DATE
}

# Add commits for Nov 6 (currently has 10, need at least 1 more)
create_commit "2025-11-06" "20" "15" "11"
create_commit "2025-11-06" "21" "30" "12"

# Add commits for Nov 7 (currently has 10, need at least 1 more)
create_commit "2025-11-07" "21" "10" "11"
create_commit "2025-11-07" "22" "45" "12"

# Add commits for Nov 21 (currently has 10, need at least 1 more)
create_commit "2025-11-21" "14" "20" "11"
create_commit "2025-11-21" "15" "35" "12"

echo "Additional commits created successfully!"

