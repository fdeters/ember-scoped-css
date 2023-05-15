import { readFile } from 'fs/promises';
import generateHash from './lib/generateAbsolutePathHash.js';
import replaceHbsInJs from './lib/replaceHbsInJs.js';
import getClassesTagsFromCss from './lib/getClassesTagsFromCss.js';
import rewriteHbs from './lib/rewriteHbs.js';
import fsExists from './lib/fsExists.js';

export default function rollupCssColocation() {
  return {
    name: 'addon-hbs-rollup',

    async transform(code, id) {
      if (id.endsWith('.hbs.js')) {
        const hbsPath = id.replace('.js', '');
        const cssPath = hbsPath.replace('.hbs', '.css');

        const cssExists = await fsExists(cssPath);
        if (cssExists) {
          // read the css file
          // TODO: get css from loader, because there are classes in imported css files; css can be stored in meta!!!!!
          // const resolution = await this.resolve(importPath, id);
          //   resolution.meta.internalImport = true;
          //   const importedCss = await this.load(resolution);
          const css = await readFile(cssPath, 'utf-8');
          const { classes, tags } = getClassesTagsFromCss(css);

          // generate unique postfix
          const postfix = generateHash(cssPath);

          // rewrite the template
          const rewrittenHbsJs = replaceHbsInJs(code, (hbs) => {
            // add dependency to the css file
            this.addWatchFile(cssPath);
            return rewriteHbs(hbs, classes, tags, postfix);
          });

          return {
            code: rewrittenHbsJs,
            // this rollup plugin changes only the template string, so the code structure is the same
            map: null,
          };
        }
      }
    },
  };
}
