### Usage

```
  Usage
    $ oneline-replacer <"file" or "directory"> --args

     Required arguments
       <"dir", required args>
       --dir, -d             specify target directory
       --ext, -e             specify target file's extension

       <"file", required args>
       --target, -t          specify target file

       <common required args>
       --replaceList, -r     specify replace properties file

  Examples
       $ oneline-replacer file --target=./abc.java --replaceList=./rlist
       $ oneline-replacer dir --dir=./ ext=java --replaceList=./rlist
```
