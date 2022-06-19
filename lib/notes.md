# Importing files in js

```js
// All functions of that file in the same folder as namspace bs
import * as bs from "./baseutils";

// Requested functions of that file in the same folder
import {search, test} from "./baseutil";

// Requested functions of that file in a subfolder
import {search, test} from "./base/baseutil";

// Requested functions of that file in parent folder
import {search, test} from "../baseutil";

// Requested functions of that file in a subfolder in parent folder
import {search, test } from "../base/baseutil";
```
