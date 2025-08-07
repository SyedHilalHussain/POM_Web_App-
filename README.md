# POM_Web_App-
Git push tutorial link : https://youtu.be/JB7YD7OKm5g?si=ol9NwKlYBtGozTRr

git branch       # Shows the current branch (with * next to it)
git status       # Shows branch and file changes


### Git Push Commands 
git add .                                      # Stages all changes <br>
git commit -m "Initial Commit"                 # Commits changes (no -a if you're adding untracked files) <br>
git push origin sAsiya                         # Pushes current branch to remote <br> <br>

Note: git commit -am only works for already-tracked files. Use git add . first when you have new files. <br>

### Git Merge Commands (merge sAsiya code into fTooba) 
git checkout sAsiya                            # Switch to sAsiya branch <br>
git pull origin sAsiya                         # Pull latest changes from remote sAsiya <br>
git fetch origin                               # Get latest from remote (required before merging remote branches) <br>
git merge origin/fTooba                        # Merge remote fTooba into local sAsiya <br>
#### OR if you already have local fTooba branch:
git merge fTooba                               # Merge local fTooba into sAsiya <br>
git commit -m "Merged fTooba into sAsiya"      # Commit the merge (if needed) <br>
git push --set-upstream origin sAsiya          # Push to remote and set tracking (only needed the first time) <br>
#### Or if not first time 
git push <br>

#### Pushing code in another repository of someone else's account 
git remote remove origin <br>
git remote add origin https://github.com/SyedHilalHussain/POM_Web_App-.git <br>
###### git push -f origin sAsiya:main
git push origin main --force
