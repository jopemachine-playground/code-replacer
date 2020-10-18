### Example 2, use only `template`

In certain situations, key, value pairs may not be required to change the string.

For example, if you need to replace all of *require* below with *import* statements,

(Whether it works or not)

We assume in this, the argument of require is `$[key]`. 

(You can name it `$[someKey1]` or `$[otherKey]` or other name (`Alphabet`, `Numeric` Available))

So, you can use this template. `require("$[key]")->import $[key] from "$[key]"`

```js
...
require("abc");
import def from "def";
require("ghi");
...
```

Then, the command is as follows.

```
code-replacer --src='./example/example_2/index.js' --template='require("$[key]")->import $[key] from "$[key]"'
```

And you can get below file.

```js
...
import abc from "abc";
import def from "def";
import ghi from "ghi";
...
```