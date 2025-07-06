# POM_Web_App-
Git push tutorial link : https://youtu.be/JB7YD7OKm5g?si=ol9NwKlYBtGozTRr

git branch       # Shows the current branch (with * next to it)
git status       # Shows branch and file changes


Git Push Commands 
git add .                                      # Stages all changes
git commit -m "Initial Commit"                 # Commits changes (no -a if you're adding untracked files)
git push origin sAsiya                         # Pushes current branch to remote

Note: git commit -am only works for already-tracked files. Use git add . first when you have new files.

Git Merge Commands (merge sAsiya code into fTooba)
git checkout sAsiya
git pull origin sAsiya (First pull recent changes into your branch)
git merge origin/fTooba
git merge fTooba
git commit -m "Merged fTooba into sAsiya"
 git push --set-upstream origin sAsiya  

git checkout sAsiya                            # Switch to sAsiya branch
git pull origin sAsiya                         # Pull latest changes from remote sAsiya
git fetch origin                               # Get latest from remote (required before merging remote branches)
git merge origin/fTooba                        # Merge remote fTooba into local sAsiya
# OR if you already have local fTooba branch:
git merge fTooba                               # Merge local fTooba into sAsiya
git commit -m "Merged fTooba into sAsiya"      # Commit the merge (if needed)
git push --set-upstream origin sAsiya          # Push to remote and set tracking (only needed the first time)
# Or if not first time 
git push

