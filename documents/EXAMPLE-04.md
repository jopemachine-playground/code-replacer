### Example 4, use csv's multiple value 

```
code-replacer --src='example/example_4/index.js' --csv='example/example_4/rlist.csv' --template='$[key1] ${source}${index} $[key2]->$[key2] ${index}${source} $[key1]'
```