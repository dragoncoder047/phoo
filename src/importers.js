/**
 * @fileoverview
 * Classes that import loaders for different types of Phoo modules.
 */

/**
 * Base class for an ImportFinder.
 */
export class ImportFinder {
    constructor() {
        this.cache = new Map();
    }
    /**
     * @param {Phoo} phoo The owner that these modules will be loaded into.
     */
    setup(phoo) {
        this.phoo = phoo;
    }
    async find(name, thread) {
        throw 'override me';
    }
    clear_cache() {
        this.cache.clear();
    }
}

/*

Grammar for imports:
import foo -> module foo in loaded modules
import* foo -> module foo in starred modules
importfrom foo [ bar baz ] -> module foo in loaded modules, bar and baz aliased to path
importfrom foo bar -> same as importfrom foo [ bar ]
import $ "some-url" bar -> some url imported as bar

*/
