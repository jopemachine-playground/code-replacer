### Example 3, use csv's multiple column

Multiple column data from the csv file are available in the following ways.

```
code-replacer --src='example/example_3/index.js' --csv='example/example_3/rlist.csv' --template='${source}${index}-><div id="${id}" class="${class}" />'
```