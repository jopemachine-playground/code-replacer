import path from 'path';
import replaceWithFile from './replaceWithFile';
import recursive from 'recursive-readdir';
import chalk from 'chalk';
import { isText } from 'istextorbinary';
import constant from './constant';
import { CommandArguments } from './type/commandArgument';

export default async function (props: CommandArguments) {
  recursive(path.resolve(props.dir!), [], async (_err: any, files: string[]) => {
    const targetFiles: (string | undefined)[] = files.map((filePath: string) => {
      const targetFileName: string = filePath.split(path.sep).reverse()[0];

      if (!targetFileName.startsWith(constant.REPLACED_PREPOSITION)) {
        if (props.src) {
          if (targetFileName === props.src) return filePath;
        } else if (props.ext) {
          if (targetFileName.endsWith(props.ext)) return filePath;
        } else {
          // Iterate all text files under current directory.
          if (isText(filePath)) return filePath;
        }
      }
    });

    // TODO: sort not works
    targetFiles.sort((a, b) => a!.localeCompare(b!));

    for (const targetFile of targetFiles) {
      if (!targetFile) continue;
      props.src = targetFile;
      await replaceWithFile(props);
      console.log(chalk.gray(`${constant.DOUBLE_SPLIT_LINE}\n`));
    }
  });
}
