import { Reporter } from '@parcel/plugin';
import { load } from 'cheerio';
import { mkdir, copyFile, readFile, writeFile} from 'node:fs';
import { join, dirname, extname, relative, resolve } from 'path';

const PROJECT_DIRECTORY = resolve("");
const STATIC_DIRECTORY = join(PROJECT_DIRECTORY, "static");
const TEMPLATES_DIRECTORY = join(PROJECT_DIRECTORY, "templates");

const DIST_DIRECTORY  = join(PROJECT_DIRECTORY, "dist");

const FLASK_APP_PATH = join(PROJECT_DIRECTORY, "comp3030j");
const FLASK_STATIC_DIRECTORY = join(FLASK_APP_PATH, "static");
const FLASK_TEMPLATES_DIRECTORY = join(FLASK_APP_PATH, "templates");

// bundle name (e.g. `main.css`) -> final relative path (like `css/main.css`)
const bundle_map = new Map();

const print = (msg) => {
    process.stdout.write(msg);
}

// Get relative path to `static` directory for final assets
// rel_file_path: file path relative to path like `static/css`, `static/js`
// return [final_relative_path, root_dir]
//   example: ["css/index.js", "(absolute path prefix)/comp3030j/static"]
function get_final_relative_path(rel_file_path) {
    const ext_name = extname(rel_file_path);
    
    let root_dir, second_dir_name;
    switch (ext_name) {
    case ".css":
        root_dir = FLASK_STATIC_DIRECTORY;
        second_dir_name = "css";
        break;
    case ".js":
        root_dir = FLASK_STATIC_DIRECTORY;
        second_dir_name = "js";
        break;
    case ".j2":
        root_dir = FLASK_TEMPLATES_DIRECTORY;
        second_dir_name = "";
        break;
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
    case ".gif":
    case ".tiff":
    case ".avif":
    case ".heic":
    case ".heif":
    case ".svg":
        root_dir = FLASK_STATIC_DIRECTORY;
        second_dir_name = "image";
        break;
    default:
        throw Error("Unrecognized file extension: ${ext_name} from ${rel_file_path}");
    }
    return [join(second_dir_name, rel_file_path), root_dir];
}

function process_jinja(file_path, post_write_function) {
    readFile(file_path, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        
        const $ = load(data, null, false);

        // here are only some common cases, add more if you needs more
        const elementsToProcess = [
            { selector: 'link[rel="stylesheet"]', attribute: 'href' },
            { selector: 'script[src]', attribute: 'src' },
            { selector: 'a[href]', attribute: 'href' },
            { selector: 'img[src]', attribute: 'src' },
        ];

        elementsToProcess.forEach(({ selector, attribute }) => {
            $(selector).each((_, element) => {
                const url = $(element).attr(attribute);
                let input_url = url.substring(1);
                if (bundle_map.has(input_url)) {
                    // Replace the URL with the Jinja2 url_for format
                    let res_url = bundle_map.get(input_url);
                    const jinja2Url = `{{ url_for('static', filename='${res_url}') }}`;
                    $(element).attr(attribute, jinja2Url);
                }
            });
        });

        writeFile(file_path, $.html(), 'utf8', (err) => {
            if (err) {
                console.error('Error writing the modified content back to the file:', err);
                return;
            }
            post_write_function();
        });
    });
}

function mkdir_copy_file(file_path, dest) {
    mkdir(dirname(dest), {recursive: true}, (err) => {
        if (err) throw err;
        copyFile(file_path, dest, (err) => {
            if (err) throw err;
        });
    });
}

function process_file(dist_dir, file_path) {
    const input_rel_path = relative(dist_dir, file_path);
    let [final_relative_path, root_dir] = get_final_relative_path(input_rel_path);
    let dest = join(root_dir, final_relative_path);
    
    if (extname(file_path) == ".j2") {
        process_jinja(file_path, () => {
            mkdir_copy_file(file_path, dest);  
        });
    } else {
        mkdir_copy_file(file_path, dest);
    }
}

export default new Reporter({
    report({event}) {
        if (event.type === 'buildSuccess') {
            bundle_map.clear();
            
            let changed_asset_file_pathes = new Set([...event.changedAssets.values()]
                .map(v => v.filePath)
                .filter(file_path => file_path.startsWith(STATIC_DIRECTORY)
                    || file_path.startsWith(TEMPLATES_DIRECTORY)));
            for (const file_path of changed_asset_file_pathes) {
                const rel_file_path = relative(PROJECT_DIRECTORY, file_path);
                print(`detect file ${rel_file_path} changed.\n`);
            }
            
            const bundles = event.bundleGraph.getBundles();

            for (const bundle of bundles) {
                const file_path = bundle.filePath;
                const rel_file_path = relative(DIST_DIRECTORY, file_path);
                const [final_rel_file_path, _] = get_final_relative_path(rel_file_path);
                if (!bundle_map.has(final_rel_file_path)) {
                    bundle_map.set(rel_file_path, final_rel_file_path);
                }
            }
            
            for (const bundle of bundles) {
                const file_path = bundle.filePath;
                process_file(DIST_DIRECTORY, file_path);
            }
        }
    }
});


