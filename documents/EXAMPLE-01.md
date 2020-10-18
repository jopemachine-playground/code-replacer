### Example 1, use `csv` and `template`

Pass the path of the input file to the `csv` option if you need it.

For example, if you wanna change `Some message..` to `alert(i18n.t("some_msg"))` for support i18n (supporting multi language feature), you can do this.

```js
// Original code, Assume this file path is ./msgAlert.js

...
alert("Some message..");
alert("Blah blah..");
...
```

Below is the input file (`csv`).

Note that `source` column is Message string including double quotes and `value` column is corresponding string key.

```
source,value
Some message..,some_msg
Blah blah..,blah_blah
```

And you need to forward some `template` value.

We assume this value is `i18n.t(${value})`.

In `template` option, `${var}` option means column data named `var`.

On each line in the source file (`msgAlert.js`), you can insert data in the csv column with the corresponding variable.

Then type the template as a form of `A->B`.

So the `template` value we need to forward is as follows.

```
"${source}"->i18n.t("${value}")
```

So if you type below command into the console,

```
code-replacer --src='example/example_1/msgAlert.js' --csv='example/example_1/rlist.csv' --template='"${source}"->i18n.t("${value}")'
```

Then you can get to below file.

```js
// This file name is __replacer__.msgAlert.js

...
alert(i18n.t("some_msg"));
alert(i18n.t("blah_blah"));
...
```

For more detailed instructions, see the topic `Options`.
