---
'@callstack/reassure-cli': minor
'reassure': minor
'@callstack/reassure-compare': patch
---

Merge (remove) `ressure compare` with `reassure measure`. Performance comparison will be generated automatically when baseline file already exists when running `measure`. You can disable that output by specifying `--no-compare` option for `measure` command.

Also set `reassure` default command as alias to `reassure measure`, so now you can run `reassure` instead of `reassure measure`.
