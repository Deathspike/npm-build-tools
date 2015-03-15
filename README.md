# npm-build-tools

Cross-platform command-line tools to help use npm as a build tool. This collection of command-line tools was  inspired by the following blog post by Keith Cirkel: [How to Use npm as a Build Tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/). Incorporating the described approach is a little hard when aiming for cross-platform support, and this collection of tools emerged to solve the pitfalls I encountered.

## Commands

### nbt-clean

Cleans an entire directory. The effect is similar to `rm -rf`. Example:

    nbt-clean www

### nbt-concat

Concatenate the  matched files and prints the output to `stdout`. Example:

    nbt-concat --source src 'scripts/**/*.js'

*Globs* are supported. Additional command line options:

* `-s, --source <s>` contains the source path in which to match files.

### nbt-copy

Copies the matched files to the destination folder. Example:

    nbt-copy --source src --destination www '*' 'content/**/*'

*Globs* are supported. Additional command line options:

* `-d, --destination<s>` contains the destination path to which to copy files.
* `-s, --source <s>` contains the source path in which to match files.

### nbt-output

Output `stdin` to the output file. Similar to `command > file`. Example:

    nbt-output non/existent/file.dat

Unlike built-in commands, `nbt-output` will create directories when necessary.

## Examples

Concatenate dependency files and output to `www/scripts/dep.min.js`:

    nbt-concat angular.min.js bootstrap.min.js jquery.min.js | nbt-output www/scripts/dep.min.js

Copy static assets from the `src` directory to the `www` directory:

    nbt-copy --source src --destination www '*' 'content/**/*'

Compiling with `browserify` to `www/scripts/apps.min.js`:

    browserify src/scripts/app.js | nbt-output www/scripts/app.min.js

Deleting the `www` folder:

    nbt-clean www
