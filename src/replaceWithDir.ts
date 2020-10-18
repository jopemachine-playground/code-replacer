import path from 'path'
import replaceWithFile from './replaceWithFile'
import recursive from 'recursive-readdir'
import chalk from 'chalk'
import constant from './constant'
import { CommandArguments } from './type/commandArgument'

export default async function (props: CommandArguments) {
  recursive(path.resolve(props.dir as string), [], async (_err, files: string[]) => {
    const targetFiles: (string | undefined)[] = files.map((filePath: string) => {
      const targetFileName: string = filePath.split(path.sep).reverse()[0]
      if (props.src && targetFileName === props.src) {
        return filePath
      } else if (
        !props.src &&
        targetFileName.split('.')[1] === props.ext &&
        !targetFileName.startsWith(constant.REPLACED_PREPOSITION)
      ) { return filePath }
    })

    // TODO: sort not works
    targetFiles.sort((a, b) => a!.localeCompare(b!))

    for (const targetFile of targetFiles) {
      if (!targetFile) continue
      props.src = targetFile
      await replaceWithFile(props)
      console.log(chalk.gray('##########################################################################################\n'))
    }
  })
}
