import { Phoo, NodeFSLoader, ES6Loader } from '../src/index.js';
import { module as builtinsModule } from '../lib/_builtins.js';
import { argv } from 'node:process';
import { readFileSync } from 'node:fs';


const file_to_test = argv[2]; // 0 = node, 1 = this file, 2+ = real args

(async function main() {
    const phoo = new Phoo({ loaders: [new NodeFSLoader('test/'), new NodeFSLoader('lib/'), new ES6Loader('../lib/')] });
    const thread = phoo.createThread('__test_runner__');
    // load builtins
    thread.module.copyFrom(builtinsModule);
    await thread.run(readFileSync('lib/builtins.ph'));
    // now run test code
    await thread.run('use test');
    await thread.run(readFileSync(file_to_test));
})();