#!/usr/bin/env python3
"""
Script to redistribute commits evenly across the past two weeks.
This will redistribute commits from Nov 14-27 (14 days).
"""

import subprocess
import sys
from datetime import datetime, timedelta
import random
import os

def run_git_command(cmd):
    """Run a git command and return the output."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running git command: {cmd}")
        print(f"Error: {e.stderr}")
        sys.exit(1)

def get_commits_since(date_str):
    """Get all commit hashes since a given date."""
    cmd = f'git log --since="{date_str}" --pretty=format:"%H" --reverse'
    output = run_git_command(cmd)
    return [line for line in output.split('\n') if line.strip()]

def redistribute_commits():
    """Main function to redistribute commits."""
    print("Starting commit redistribution...")
    
    # Check for unstaged changes
    status = run_git_command("git status --porcelain")
    if status:
        print("Warning: You have unstaged changes.")
        print("Stashing changes before redistribution...")
        run_git_command("git stash push -u -m 'Auto-stash before commit redistribution'")
        stashed = True
    else:
        stashed = False
    
    try:
        # Base date (Nov 14, 2025 - 2 weeks ago from Nov 27)
        base_date = datetime(2025, 11, 14)
        end_date = datetime(2025, 11, 27)
        days = 14
        
        # Get all commits from the past 2 weeks
        print("Collecting commits from the past 2 weeks...")
        commits = get_commits_since("2 weeks ago")
        total_commits = len(commits)
        
        if total_commits == 0:
            print("No commits found in the past 2 weeks.")
            return
        
        print(f"Total commits to redistribute: {total_commits}")
        
        # Calculate commits per day
        commits_per_day = total_commits // days
        extra_commits = total_commits % days
        
        print(f"Commits per day: {commits_per_day}")
        print(f"Extra commits to distribute: {extra_commits}")
        
        # Create date assignments
        commit_dates = []
        commit_index = 0
        
        for day in range(days):
            current_date = base_date + timedelta(days=day)
            
            # Determine how many commits for this day
            if day < extra_commits:
                commits_for_day = commits_per_day + 1
            else:
                commits_for_day = commits_per_day
            
            # Assign commits to this day with random times
            for i in range(commits_for_day):
                # Generate a random time between 9 AM and 6 PM
                hour = random.randint(9, 17)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                
                commit_datetime = current_date.replace(hour=hour, minute=minute, second=second)
                commit_dates.append(commit_datetime)
                commit_index += 1
        
        print(f"\nDate assignments created for {len(commit_dates)} commits")
        
        # Create backup branch
        backup_branch = f"backup-before-redistribute-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        print(f"\nCreating backup branch: {backup_branch}")
        run_git_command(f"git branch {backup_branch}")
        
        # Get the commit before the range we're modifying
        try:
            before_commit = run_git_command('git log --before="2 weeks ago" -1 --pretty=format:"%H"')
        except:
            # If no commits before, use the first commit
            before_commit = run_git_command('git rev-list --max-parents=0 HEAD | head -1')
        
        print(f"Base commit (before range): {before_commit[:8]}...")
        
        # Create a temporary file with commit date mappings (by index)
        import tempfile
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        
        for i, date_obj in enumerate(commit_dates):
            date_str = date_obj.strftime('%Y-%m-%d %H:%M:%S')
            temp_file.write(f"{i}|{date_str}\n")
        
        temp_file.close()
        
        print(f"\nRedistributing commits...")
        print("This may take a while...")
        
        # Use git filter-branch to change commit dates
        # We need to match commits by their position in chronological order
        # Get all commits in chronological order (oldest first) before filter-branch
        commits_ordered = run_git_command(f'git log --since="2 weeks ago" --pretty=format:"%H" --reverse')
        commit_list_ordered = [c for c in commits_ordered.split('\n') if c.strip()]
        
        # Write mapping file with commit hashes (original hashes, before filter-branch)
        mapping_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        for commit_hash, date_obj in zip(commit_list_ordered, commit_dates):
            date_str = date_obj.strftime('%Y-%m-%d %H:%M:%S')
            mapping_file.write(f"{commit_hash}|{date_str}\n")
        mapping_file.close()
        
        # Write the filter script
        # During filter-branch, we process commits from oldest to newest
        # We'll use a counter file to track which commit we're on
        counter_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
        counter_file.write("0")
        counter_file.close()
        
        # Create the filter script file
        filter_script = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.sh')
        filter_script.write(f'''#!/bin/bash
# Map commit by calculating its position in chronological order
BEFORE_COMMIT="{before_commit}"
TEMP_FILE="{temp_file.name}"
COUNTER_FILE="{counter_file.name}"

# Check if this commit is after BEFORE_COMMIT
if git merge-base --is-ancestor "$BEFORE_COMMIT" "$GIT_COMMIT" 2>/dev/null; then
    # Calculate position: count commits from BEFORE_COMMIT to GIT_COMMIT in chronological order
    # Get all commits in range in reverse chronological order
    ALL_COMMITS=$(git rev-list --reverse "$BEFORE_COMMIT"..HEAD 2>/dev/null)
    TOTAL=$(echo "$ALL_COMMITS" | wc -l)
    
    # Find position of current commit (1-indexed in the list)
    POS=$(echo "$ALL_COMMITS" | grep -n "^$GIT_COMMIT$" | cut -d: -f1)
    
    # Convert to 0-indexed
    INDEX=$((POS - 1))
    
    # Only process if in our target range
    if [ "$INDEX" -ge 0 ] && [ "$INDEX" -lt {total_commits} ] && [ -n "$POS" ]; then
        # Get date from our date list by index
        NEW_DATE=$(sed -n "$((INDEX + 1))p" "$TEMP_FILE" | cut -d'|' -f2)
        if [ -n "$NEW_DATE" ]; then
            export GIT_AUTHOR_DATE="$NEW_DATE"
            export GIT_COMMITTER_DATE="$NEW_DATE"
        fi
    fi
fi
''')
        filter_script.close()
        os.chmod(filter_script.name, 0o755)
        
        try:
            # Run git filter-branch
            cmd = f'git filter-branch -f --env-filter "bash {filter_script.name}" --tag-name-filter cat -- --all'
            print("Running git filter-branch (this may take several minutes)...")
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"Warning: git filter-branch returned non-zero exit code")
                print(f"Output: {result.stdout}")
                print(f"Error: {result.stderr}")
                print("\nYou may need to clean up with: git filter-branch --reset")
            else:
                print("\nCommit redistribution complete!")
        finally:
            # Clean up temporary files
            os.unlink(temp_file.name)
            os.unlink(filter_script.name)
            if 'mapping_file' in locals():
                os.unlink(mapping_file.name)
            if 'counter_file' in locals():
                os.unlink(counter_file.name)
        
        # Show new distribution
        print("\nNew commit distribution:")
        distribution = run_git_command('git log --since="2 weeks ago" --pretty=format:"%ad" --date=short | sort | uniq -c')
        print(distribution)
    
        print("\n" + "="*60)
        print("Next steps:")
        print("1. Review the commit distribution above")
        print("2. Verify with: git log --since='2 weeks ago' --pretty=format:'%ad|%s' --date=short")
        print("3. If satisfied, force push with: git push origin --force --all")
        print("4. To restore from backup: git reset --hard " + backup_branch)
        if stashed:
            print("5. Restore stashed changes with: git stash pop")
        print("="*60)
    except Exception as e:
        print(f"\nError during redistribution: {e}")
        if stashed:
            print("Restoring stashed changes...")
            run_git_command("git stash pop")
        raise

if __name__ == "__main__":
    redistribute_commits()

