module.exports = function(grunt) {

    /*
     * Modules
     */

    var userhome = require("userhome");
    var merge = require("merge");
    var path = require("path");


    /*
     * Load placeholders
     */
    var placeholders = grunt.file.readJSON("placeholders.json");


    /*
     * Configuration
     */

    var config = {
        buildDir: path.join(path.resolve(), "build"), // Use an absolute path to fix problems when using the external extension compilers

        iconsDir: path.join(path.resolve(), "icons"),

        path: {
            cfx: path.join(userhome(), "bin", "cfx"), // https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip
            chrome: path.join(path.sep, "Applications", "Google Chrome.app", "Contents", "MacOS", "Google Chrome"),
            chrome_pem: path.join(userhome(), ".d2ne", "chrome.pem"), // Generated by Chrome the first time
            openssl: "openssl",
            safari_cert_dir: path.join(userhome(), ".d2ne", "safari"), // http://developer.streak.com/2013/01/how-to-build-safari-extension-using.html
            xar: path.join(userhome(), "bin", "xar"), // https://github.com/downloads/mackyle/xar/xar-1.6.1.tar.gz
            zip: "zip" // Must support -j and -@
        },

        compiled_script: {
            outputFile: null,
            inputDir: "src"
        },

        userscript: {
            outputFile: null,
            workingDir: null,
            inputDir: "userscript"
        },
        chrome_crx: {
            outputFile: null,
            workingDir: null,
            inputDir: "chrome"
        },
        chrome_zip: {
            outputFile: null,
            workingDir: null,
            inputDir: "chrome"
        },
        firefox: {
            outputFile: null,
            workingDir: null,
            inputDir: "firefox"
        },
        opera: {
            outputFile: null,
            workingDir: null,
            inputDir: "opera"
        },
        safari: {
            outputFile: null,
            workingDir: null,
            inputDir: "safari"
        }
    };

    config.compiled_script.outputFile = path.join(config.buildDir, placeholders.compiled_script);

    config.userscript.outputFile = path.join(config.buildDir, "userscript.user.js");
    config.chrome_crx.outputFile = path.join(config.buildDir, "chrome.crx");
    config.chrome_zip.outputFile = path.join(config.buildDir, "chrome.zip");
    config.firefox.outputFile = path.join(config.buildDir, "firefox.xpi");
    config.opera.outputFile = path.join(config.buildDir, "opera.nex");
    config.safari.outputFile = path.join(config.buildDir, "safari.safariextz");

    config.userscript.workingDir = path.join(config.buildDir, "userscript");
    config.chrome_crx.workingDir = path.join(config.buildDir, "chrome");
    config.chrome_zip.workingDir = path.join(config.buildDir, "chrome");
    config.firefox.workingDir = path.join(config.buildDir, "firefox");
    config.opera.workingDir = path.join(config.buildDir, "opera");
    config.safari.workingDir = path.join(config.buildDir, "safari.safariextension");


    /*
     * Grunt init
     */

    grunt.config.init({
        pkg: grunt.file.readJSON("package.json"),

        _pack: {
            userscript: {
                outputFile: config.userscript.outputFile,
                workingDir: config.userscript.workingDir,
                inputDir: config.userscript.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("concat:userscript");
                }
            },
            chrome_crx: {
                outputFile: config.chrome_crx.outputFile,
                workingDir: config.chrome_crx.workingDir,
                inputDir: config.chrome_crx.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("shell:pack_chrome_crx");
                }
            },
            chrome_zip: {
                outputFile: config.chrome_zip.outputFile,
                workingDir: config.chrome_zip.workingDir,
                inputDir: config.chrome_zip.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("shell:pack_chrome_zip");
                }
            },
            firefox: {
                outputFile: config.firefox.outputFile,
                workingDir: config.firefox.workingDir,
                inputDir: config.firefox.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("shell:pack_firefox");
                }
            },
            opera: {
                outputFile: config.opera.outputFile,
                workingDir: config.opera.workingDir,
                inputDir: config.opera.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("shell:pack_opera");
                }
            },
            safari: {
                outputFile: config.safari.outputFile,
                workingDir: config.safari.workingDir,
                inputDir: config.safari.inputDir,
                custom: function(workingDir, OutputFile) {
                    grunt.task.run("shell:pack_safari");
                }
            }
        },

        clean: {
            all: [config.buildDir],
            all_working_dirs: [
                config.userscript.workingDir,
                config.chrome_crx.workingDir,
                config.chrome_zip.workingDir,
                config.firefox.workingDir,
                config.opera.workingDir,
                config.safari.workingDir
            ],
            userscript: [config.userscript.workingDir],
            chrome_crx: [config.chrome_crx.workingDir],
            chrome_zip: [config.chrome_zip.workingDir],
            firefox: [config.firefox.workingDir],
            opera: [config.opera.workingDir],
            safari: [config.safari.workingDir]
        },

        concat: {
            options: {
                separator: "\n"
            },
            compiled_script: {
                src: [path.join(config.compiled_script.inputDir, "**", "*.js")],
                dest: config.compiled_script.outputFile
            },
            userscript: {
                src: [path.join(config.userscript.workingDir, "metadata.js"),
                      config.compiled_script.outputFile],
                dest: config.userscript.outputFile
            }
        },

        copy: {
            options: {
                process: function(content) {
                    return grunt.template.process(content, {
                        data: merge(grunt.config("pkg"), placeholders)
                    });
                },
                processContentExclude: [path.join("**", "*.png")]
            },

            userscript: {
                cwd: config.userscript.inputDir,
                src: ["**"],
                dest: config.userscript.workingDir,
                filter: "isFile",
                expand: true
            },
            chrome_crx: {
                files: [
                    {
                        cwd: config.chrome_crx.inputDir,
                        src: ["**"],
                        dest: config.chrome_crx.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.buildDir,
                        src: [placeholders.compiled_script],
                        dest: config.chrome_crx.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.iconsDir,
                        src: ["icon48.png", "icon128.png"],
                        dest: config.chrome_crx.workingDir,
                        filter: "isFile",
                        expand: true
                    }
                ]
            },
            chrome_zip: {
                files: [
                    {
                        cwd: config.chrome_zip.inputDir,
                        src: ["**"],
                        dest: config.chrome_zip.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.buildDir,
                        src: [placeholders.compiled_script],
                        dest: config.chrome_zip.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.iconsDir,
                        src: ["icon48.png", "icon128.png"],
                        dest: config.chrome_zip.workingDir,
                        filter: "isFile",
                        expand: true
                    }
                ]
            },
            firefox: {
                files: [
                    {
                        cwd: config.firefox.inputDir,
                        src: ["**"],
                        dest: config.firefox.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.buildDir,
                        src: [placeholders.compiled_script],
                        dest: config.firefox.workingDir,
                        filter: "isFile",
                        expand: true
                    }
                ]
            },
            opera: {
                files: [
                    {
                        cwd: config.opera.inputDir,
                        src: ["**"],
                        dest: config.opera.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.buildDir,
                        src: [placeholders.compiled_script],
                        dest: config.opera.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.iconsDir,
                        src: ["icon48.png", "icon128.png"],
                        dest: config.opera.workingDir,
                        filter: "isFile",
                        expand: true
                    }
                ]
            },
            safari: {
                files: [
                    {
                        cwd: config.safari.inputDir,
                        src: ["**"],
                        dest: config.safari.workingDir,
                        filter: "isFile",
                        expand: true
                    },
                    {
                        cwd: config.buildDir,
                        src: [placeholders.compiled_script],
                        dest: config.safari.workingDir,
                        filter: "isFile",
                        expand: true
                    }
                ]
            }
        },

        shell: {
            options: {
                stdout: false
            },
            pack_chrome_crx: {
                command: function() {
                    var cmd = "'" + config.path.chrome + "' --pack-extension='" + config.chrome_crx.workingDir + "' --pack-extension-key='" + config.path.chrome_pem + "'";
                    return cmd;
                }
            },
            pack_chrome_zip: {
                command: function() {
                    var cmd = 'echo ' + grunt.file.expand(config.chrome_zip.workingDir + "**" + path.sep + "*").join(' ') + " | tr ' ' '\n' | " + config.path.zip + " -j " + config.chrome_zip.outputFile + " -@";
                    return cmd;
                }
            },
            pack_firefox: {
                command: function () {
                    var cmd = "cd '" + config.firefox.workingDir + "' && '" + config.path.cfx + "' xpi --output-file='" + config.firefox.outputFile + "'";
                    return cmd;
                }
            },
            pack_opera: {
                command: function() {
                    var cmd =
                        "'" + config.path.chrome + "' --pack-extension=" + config.opera.workingDir + " --pack-extension-key=" + config.path.chrome_pem + ";" +
                        "mv " + path.join(config.buildDir, "opera.crx") + " " + config.opera.outputFile;
                    return cmd;
                }
            },
            pack_safari: {
                command: function() {
                    var cmd =
                        "digest_file='" + path.join(config.safari.workingDir, "digest.dat") + "';" +
                        "sig_file='" + path.join(config.safari.workingDir, "sig.dat") + "';" +
                        "cd '" + path.join(config.safari.workingDir, "..") + "' && " + config.path.xar + " -czf " + config.safari.outputFile + " --distribution \"$(basename '" + config.safari.workingDir + "')\";" +
                        config.path.xar + " --sign -f '" + config.safari.outputFile + "' --digestinfo-to-sign \"$digest_file\" --sig-size \"$(cat '" + path.join(config.path.safari_cert_dir, "size") + "')\" --cert-loc '" + path.join(config.path.safari_cert_dir, "cert.der") + "' --cert-loc '" + path.join(config.path.safari_cert_dir, "cert01") + "' --cert-loc '" + path.join(config.path.safari_cert_dir, "cert02") + "';" +

                        config.path.openssl + " rsautl -sign -inkey '" + path.join(config.path.safari_cert_dir, "key.pem") + "' -in \"$digest_file\" -out \"$sig_file\";" +
                        config.path.xar + " --inject-sig \"$sig_file\" -f '" + config.safari.outputFile + "'";
                    return cmd;
                }
            }
        },

        jshint: {
            src: [config.compiled_script.outputFile],
            options: {
                // --------------------------------------------------------------------
                // JSHint Configuration, Strict Edition
                // --------------------------------------------------------------------
                //
                // This is a options template for [JSHint][1], using [JSHint example][2]
                // and [Ory Band"s example][3] as basis and setting config values to
                // be most strict:
                //
                // * set all enforcing options to true
                // * set all relaxing options to false
                // * set all environment options to false, except the browser value
                // * set all JSLint legacy options to false
                //
                // [1]: http://www.jshint.com/
                // [2]: https://github.com/jshint/node-jshint/blob/master/example/config.json
                // [3]: https://github.com/oryband/dotfiles/blob/master/jshintrc
                //
                // @author http://michael.haschke.biz/
                // @license http://unlicense.org/

                // == Enforcing Options ===============================================
                //
                // These options tell JSHint to be more strict towards your code. Use
                // them if you want to allow only a safe subset of JavaScript, very
                // useful when your codebase is shared with a big number of developers
                // with different skill levels.

                "bitwise"       : true,     // Prohibit bitwise operators (&, |, ^, etc.).
                "curly"         : true,     // Require {} for every new block or scope.
                "eqeqeq"        : true,     // Require triple equals i.e. `===`.
                "forin"         : true,     // Tolerate `for in` loops without `hasOwnPrototype`.
                "immed"         : true,     // Require immediate invocations to be wrapped in parens e.g. `( function(){}() );`
                "latedef"       : true,     // Prohibit variable use before definition.
                "newcap"        : true,     // Require capitalization of all constructor functions e.g. `new F()`.
                "noarg"         : true,     // Prohibit use of `arguments.caller` and `arguments.callee`.
                "noempty"       : true,     // Prohibit use of empty blocks.
                "nonew"         : true,     // Prohibit use of constructors for side-effects.
                "plusplus"      : true,     // Prohibit use of `++` & `--`.
                "regexp"        : true,     // Prohibit `.` and `[^...]` in regular expressions.
                "undef"         : true,     // Require all non-global variables be declared before they are used.
                "strict"        : true,     // Require `use strict` pragma in every file.
                "trailing"      : true,     // Prohibit trailing whitespaces.

                // == Relaxing Options ================================================
                //
                // These options allow you to suppress certain types of warnings. Use
                // them only if you are absolutely positive that you know what you are
                // doing.

                "asi"           : false,    // Tolerate Automatic Semicolon Insertion (no semicolons).
                "boss"          : false,    // Tolerate assignments inside if, for & while. Usually conditions & loops are for comparison, not assignments.
                "debug"         : false,    // Allow debugger statements e.g. browser breakpoints.
                "eqnull"        : false,    // Tolerate use of `== null`.
                "es5"           : false,    // Allow EcmaScript 5 syntax.
                "esnext"        : false,    // Allow ES.next specific features such as `const` and `let`.
                "evil"          : false,    // Tolerate use of `eval`.
                "expr"          : false,    // Tolerate `ExpressionStatement` as Programs.
                "funcscope"     : false,    // Tolerate declarations of variables inside of control structures while accessing them later from the outside.
                "globalstrict"  : false,    // Allow global "use strict" (also enables "strict").
                "iterator"      : false,    // Allow usage of __iterator__ property.
                "lastsemic"     : false,    // Tolerat missing semicolons when the it is omitted for the last statement in a one-line block.
                "laxbreak"      : false,    // Tolerate unsafe line breaks e.g. `return [\n] x` without semicolons.
                "laxcomma"      : false,    // Suppress warnings about comma-first coding style.
                "loopfunc"      : false,    // Allow functions to be defined within loops.
                "multistr"      : false,    // Tolerate multi-line strings.
                "onecase"       : false,    // Tolerate switches with just one case.
                "proto"         : false,    // Tolerate __packroto__ property. This property is deprecated.
                "regexdash"     : false,    // Tolerate unescaped last dash i.e. `[-...]`.
                "scripturl"     : true,    // Tolerate script-targeted URLs.
                "smarttabs"     : false,    // Tolerate mixed tabs and spaces when the latter are used for alignmnent only.
                "shadow"        : false,    // Allows re-define variables later in code e.g. `var x=1; x=2;`.
                "sub"           : false,    // Tolerate all forms of subscript notation besides dot notation e.g. `dict["key"]` instead of `dict.key`.
                "supernew"      : false,    // Tolerate `new function () { ... };` and `new Object;`.
                "validthis"     : true,    // Tolerate strict violations when the code is running in strict mode and you use this in a non-constructor function.

                // == Environments ====================================================
                //
                // These options pre-define global variables that are exposed by
                // popular JavaScript libraries and runtime environments—such as
                // browser or node.js.

                "browser"       : true,     // Standard browser globals e.g. `window`, `document`.
                "couch"         : false,    // Enable globals exposed by CouchDB.
                "devel"         : false,    // Allow development statements e.g. `console.log();`.
                "dojo"          : false,    // Enable globals exposed by Dojo Toolkit.
                "jquery"        : false,    // Enable globals exposed by jQuery JavaScript library.
                "mootools"      : false,    // Enable globals exposed by MooTools JavaScript framework.
                "node"          : false,    // Enable globals available when code is running inside of the NodeJS runtime environment.
                "nonstandard"   : false,    // Define non-standard but widely adopted globals such as escape and unescape.
                "prototypejs"   : false,    // Enable globals exposed by Prototype JavaScript framework.
                "rhino"         : false,    // Enable globals available when your code is running inside of the Rhino runtime environment.
                "wsh"           : false,    // Enable globals available when your code is running as a script for the Windows Script Host.

                // == JSLint Legacy ===================================================
                //
                // These options are legacy from JSLint. Aside from bug fixes they will
                // not be improved in any way and might be removed at any point.

                "nomen"         : false,    // Prohibit use of initial or trailing underbars in names.
                "onevar"        : false,    // Allow only one `var` statement per function.
                "passfail"      : false,    // Stop on first error.
                "white"         : false,    // Check against strict whitespace and indentation rules.

                // == Undocumented Options ============================================
                //
                // While I"ve found these options in [example1][2] and [example2][3]
                // they are not described in the [JSHint Options documentation][4].
                //
                // [4]: http://www.jshint.com/options/

                "maxerr"        : 100,      // Maximum errors before stopping.
                "predef"        : [         // Extra globals.
                    "GM_xmlhttpRequest",
                    "safari"
                ]//,
                //"indent"        : 4         // Specify indentation spacing
            }
        }
    });


    /*
     * Register custom tasks
     */

    grunt.registerTask("default", "Call the task `pack`.", ["pack"]);

    grunt.registerTask("pack", "Pack all the extensions", function(target) {
        grunt.task.run("clean:all");
        grunt.task.run("compile");

        // if no target provided, pack everything
        if (typeof target === "undefined") {
            grunt.task.run("copy");
            grunt.task.run("_pack");
            //grunt.task.run("clean:all_working_dirs");
        } else {
            grunt.task.run("copy:" + target);
            grunt.task.run("_pack:" + target);
            //grunt.task.run("clean:" + target);
        }
    });

    grunt.registerMultiTask("_pack", " ", function() {
        // If the target needs a custom process
        if (typeof this.data.custom === "function") {
            // Use file(s) in the working directory to generate the output file
            this.data.custom(this.data.workingDir, this.data.outputFile);
        }
    });

    grunt.registerTask("test", "Launch the tests.", ["clean:all", "compile", "jshint"]);

    grunt.registerTask("compile", "Concatenate the JavaScript files into one.", ["concat:compiled_script"]);


    /*
     * Load NPM tasks
     */

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-shell');

};
