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