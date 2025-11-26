import os
import random
import subprocess
from datetime import datetime, timedelta

start_date = datetime(2025, 11, 1)
end_date = datetime(2025, 11, 26)

# Create the log file if it doesn't exist
log_file = "commit_log.txt"
if not os.path.exists(log_file):
    with open(log_file, "w") as f:
        f.write("Commit Log\n")

current_date = start_date
while current_date <= end_date:
    # Generate 10 to 15 commits per day
    num_commits = random.randint(10, 15)
    
    for i in range(num_commits):
        # Random time between 09:00 and 23:00
        hour = random.randint(9, 23)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        
        commit_date_str = current_date.strftime(f"%Y-%m-%dT{hour:02d}:{minute:02d}:{second:02d}")
        
        # Append to log file to make the commit non-empty
        with open(log_file, "a") as f:
            f.write(f"Commit entry {commit_date_str} - {i+1}\n")
            
        env = os.environ.copy()
        env["GIT_AUTHOR_DATE"] = commit_date_str
        env["GIT_COMMITTER_DATE"] = commit_date_str
        
        # Stage the log file
        subprocess.run(["git", "add", log_file], check=True)
        
        # Commit
        subprocess.run(
            ["git", "commit", "-m", f"Update log {current_date.strftime('%Y-%m-%d')} - {i+1}"],
            env=env,
            check=True
        )
    
    print(f"Generated {num_commits} commits for {current_date.strftime('%Y-%m-%d')}")
    current_date += timedelta(days=1)
