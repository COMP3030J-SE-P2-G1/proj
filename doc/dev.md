# Developer Guide

## Requirement

1. python version: see [pyproject.toml](../pyproject.toml)
2. [editorconfig](https://editorconfig.org/) plugin for your text editor or IDE.

## Directory Structure

- `templates`: jinja2 template should be placed here.
- `static`: CSS, JS and image files should be placed here
  - `css`: css file
  - `js`: js file
  - `image`: image file
- `scipt`: script files (e.g. scripts for initializing project)
- `doc`: documents should be put here
- `instance`: flask application instance file (i.e. configurations, database etc.)
- `comp3012`: Out Flask application 
  - `views`: code related to display pages
  - `api`: code that responsible for transferring data, not page.
  - `db`: database related code, e.g. defined models
  - `utils`: utility functions
  - `static`: the output static directory (processed files originally from project root's `static`)
    - `css`: output CSS files (don't put your code here)
    - `js`: output JS file (don't put your code here)
    - `image`: output image file (don't put your code here)
    - other directories (you can put your code or other resources here)
  - `templates`: the output templates directory, which holds the processed html/jinja file

## Setup
+ Clone this project and change directory into the project root
   > note: the step 2 - 4 is not needed if you use [rye](https://github.com/astral-sh/rye).
   > Instead, you only need to do `rye sync`.
  
+ Create virtual environment
   ```bash
   python -m venv .venv
   ```
+ Activate virtual environment
+ Download dependencies
   ```bash
   pip install . # note the trailing dot
   ```

+ Initialize project   
  You need to have [bun](https://github.com/oven-sh/bun) or [node](https://nodejs.org) installed.  
  Also, it's recommended to have executable [just](https://github.com/casey/just) installed. If you don't, then you may need to look into [../justfile](../justfile) file to figure out the actually commands of the commands shown below.  
  After you installed the `just`, you need to create an empty file called `.justfile-env` (note the prefix dot) at the project root.  
  Then you can initialize the project
  ```bash
  just initialize
  ```
  Take a look at  and [../.justfile-env.example](../.justfile-env), you can use 
  custom executable files to run the same command(set the command in `.justfile-env`).  
  
  > alpha feature:  
  > run `env POPULATE_DB=true ADMIN=A ADMIN_EMAIL=B just initialize` command
  > to populate database.
  
## Command 

- List all the command (with short descriptions)
  ```bash
  just --list
  ```

- Start development
  ```bash
  just
  ```
  or `just run`  
  If you see command failed, please look into its log using command `just logs`. If you can see the logs contains error message `Error: _plugin(...).Resolver is not a constructor`. Then you need to change the content of the file [/script/parcel-reporter-jinja.mjs](../script/parcel-reporter-jinja.mjs). Temporarily delete the following content (and then restore it after a successful run)  
      1. `import { load } from 'cheerio';`  
      2. 
         ```js
         process_jinja(file_path, () => {
            mkdir_copy_file(file_path, dest);  
         });
         ```  
      Then run `just start` again. It should run without error this time. Now, restore the changes that you have made. Run the command `just start` the third time.
  
- See pm2 managed processes' state
  ```bash
  just stat
  ```
  
- See programs logs
  ```bash
  just logs
  ```
  
- Stop development
  ```bash
  just kill
  ```
 
- Automatically process HTML, Jinja2, CSS, JavaScript files, and copied them to corresponding output directory using Parcel.
  ```bash
  just parcel
  ```
  > Note, default is in `watch` mode, and output files are not optimized. Use `just parcel-build` to produce an optimized version of files.  
  
- Build the project  
  Currently, it only processes static and template files, and doesn't produce a WSGI assets.
  ```bash
  just build
  ```
  
## File Processing Explain (Must Read)

### Tailwind

`/static/css/main.tailwind.css` will be compiled to `/static/css/main.css`.

### Parcel

> `/` means project root directory.  
While reading this manual, you'd better take a look at the file changes inside `/dist` directory and `/comp3030j/static` or `comp3030j/templates` directory.  
You must write jinja template(extension must be `.j2` ) in `/templates` directory. Example file(say `index.j2`):
```jinja2
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="/static/css/main.css" rel="stylesheet">
    </head>
    <body>
        <a href="{{ url_for('static', filename='css/index.05e00fde.css') }}">
        <h1 class="text-3xl font-bold underline">
            El Psy Kongaroo
        </h1>
    </body>
</html>
```
Note there are two urls: `../static/css/main.css` and `{{ url_for('static', filename='css/index.05e00fde.css') }}`. The normal syntax one will be processed, the other one will be left as untouched.  
1. `/static/css/main.css`: parcel will follow the link, optimize this css file and produce the final result inside `/dist` directory.  
2. The jinja file itself will also be optimized, and be produced to `/dist` directory.  
3. After that, our `parcel-reporter-jinja` script/plugin will transfer them to correct place inside `/comp3030j` directory (like `/comp3030j/static/css/index.05e00fde.css` and `/comp3030j/templates/index.j2`).  

So:  
1. when you use normal link like `/static/css/main.css`, it means you are using a file inside `/static` directory, and the linked file will be processed.  
2. when you use normal link that begins with a `http` or `https` prefix like `https://example.com`, the link will not be touched.  
3. when you use a jinja link like `{{ url_for('static', filename='css/index.05e00fde.css') }}`, the link will not be touched, and it indicates that you are using a file from directory `/comp3030j/static/`.  

If you have problems, pls let me know. 