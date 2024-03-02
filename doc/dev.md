# Developer Guide

## Requirement

1. python version: see [pyproject.toml](../pyproject.toml)
2. [editorconfig](https://editorconfig.org/) plugin for your text editor or IDE.

## Setup
+ Clone this project and change directory into the project root
   > note: the step 2 and step 3 is not needed if you use [rye](https://github.com/astral-sh/rye).
   > Instead, you only need to do `rye sync`.
  
+ Create virtual environment
   ```bash
   python -m venv .venv
   ```

+ Download dependencies
   ```bash
   pip install . # note the trailing dot
   ```

+ Initialize project 
  If you have [just](https://github.com/casey/just) installed, you can run
  ```bash
  just initialize
  ```
  to create `instance/config.py` file and `instance/comp3033j.db` sqlite3 database.
  > alpha feature:  
  > run `env POPULATE_DB=true ADMIN=A ADMIN_EMAIL=B just initialize` command
  > to populate database.
  Otherwise you need to take a look at [../justfile](../justfile) to see what actually the 
  command does. It's simple to guess.
  
## Command 

- Run flask application in debug mode:
  > if you don't have `rye` installed, you need to activate the virtual environment first
  ```bash
  just run # or `just flask`
  ```
  
- Auto refresh browser when page changes
  You need to have [browser-sync](https://browsersync.io/) installed.  
  ```bash
  just browser-sync
  ```
  
- Auto compile tailwind css
  You need to have [bun](https://github.com/oven-sh/bun) or [node](https://nodejs.org) installed. Then run 
  ```bash
  bun install
  ```
  or
  ```bash
  npm install
  ```
  Then you can compile the CSS file
  ```bash
  just tailwind
  ```
  the default behavior is watching the tailwind class names occurrence in our template and static files (i.e. html, js, etc.), and then compile a minimal css file for us.
  
  
## Favored Workflow

```bash
just run & # `&` means runs in the background
just tailwind &
just browser-sync &
```
If you want to kill all the application, you only need to kill that terminal enumerator or its tab (IDW Windows). 
