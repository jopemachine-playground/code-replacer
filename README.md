### Usage

```
  Usage
    $ replaceWithFile <file or directory> --args

     Options
       <dir required args>
       --dir, -d             specify target directory
       --ext                 specify target file's extension

       <file required args>
       --target              specify target file

       <common required args>
       --replaceListFile     specify replace properties file

  Examples
       $ oneline-replacer file target=./dmain.jsp replaceList=./rlist
       $ oneline-replacer dir dir=./ ext=jsp replaceList=./rlist
```
