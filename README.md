# npm-build-tools

Cross-platform command-line tools to help use npm as a build tool. This collection of command-line tools was  inspired by the following blog post by Keith Cirkel: [How to Use npm as a Build Tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/). Incorporating the described approach is a hard when aiming for cross-platform support, and this collection of tools emerged to solve the pitfalls I encountered.

## Commands

### n-clean

Cleans a directory or file. The effect is similar to `rm -rf`. Example:

    n-clean www

### n-concat

Concatenates the matched files and prints to `stdout`. Example:

    n-concat --source src 'scripts/**/*.js'

*Globs* are supported. Additional command line options:

* `-s, --source <s>` contains the source path.

### n-copy

Copies the matched files to the destination folder. Example:

    n-copy --source src --destination www '*' 'content/**/*'

*Globs* are supported. Additional command line options:

* `-d, --divider<s>` contains the divider (default \n).
* `-s, --source <s>` contains the source path.

### n-embed

Transforms HTML files into an embedded angular $templateCache wrapper module.

    n-embed -s src views/**/*.html

Additional command line options:

* `-m, --module <s>` contains the module name (default: app).
* `-s, --source <s>` contains the source path.

### n-pipe

Pipe `stdin` to a file. Similar to `> file`. Example:

    n-pipe non/existent/file.dat

Unlike built-in commands, `n-pipe` creates directories when necessary.

### n-run

Executes command(s) in parallel. Example:

    n-run "echo Hello world!" "echo Hello world!"

A watcher can be created to run command(s) on a file change. Example:

    n-run -w *.js "echo The file changed!"

Glob expansions are supported with `$g[]`. Example:

    n-run "jshint $g[*.js]"

Variable expansions (from `package.json/config`) are supported with `$v[]`. Example:

    n-run "n-concat $v[js-bower-dependencies]"

Additional command line options:

* `-s, --source <s>` contains the source path (for expand/watch).
* `-w, --watch <s>` contains the watched files.

## Examples

Concatenate dependency files and pipe to `www/scripts/dep.min.js`:

    n-concat angular.min.js bootstrap.min.js jquery.min.js | n-pipe www/scripts/dep.min.js

Copy static assets from the `src` directory to the `www` directory:

    n-copy --source src --destination www '*' 'content/**/*'

Compiling with `browserify` to `www/scripts/apps.min.js`:

    browserify src/scripts/app.js | n-pipe www/scripts/app.min.js

Deleting the `www` folder:

    n-clean www
