### Commands for updates

* Create branch:
    ```bash
    git subtree push --prefix dist origin gh-pages
    ```
* Push updates:
    ```bash
    git subtree push --prefix dist origin gh-pages
    ```
* Restart branch:
    ```bash
    git push origin --delete gh-pages
    git subtree push --prefix dist origin gh-pages
    ```
    
* angular-cli-ghpages:
    ```bash
    ngh --repo=https://e2d72e7f7a0176daf60e92da09810b5d6b804b75@github.com/itsmadebyark/ngping.git
    ```