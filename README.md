# Updating all files, directories paths and the TypeScript imports to kebab case
> If you want different case you can update in the change-case.js file

Usage:
```bash
npm install
node src/index.js <folder-path>
```


## Tip: eslint rules
To keep the files and folder structure in the wanted naming convention, use this eslint config

```bash
npm i -D eslint-plugin-check-file
```

The eslint config
```json5
{
  // ...
  "plugins": ["check-file"],
  "rules": {
    "check-file/filename-naming-convention":[
      "error",
      {
        // kebaba-case that allow numbers at the start
        // done manually because it has a bug - DukeLuo/eslint-plugin-check-file#7
        "**/*.{js,ts}":"+([a-z0-9])*(-+([a-z0-9]))"
      },
      {
        "ignoreMiddleExtensions": true
      }
    ],
    "check-file/folder-naming-convention":[
      "error",
      {
        // TODO - if you use `src` folder, change it here 
        "app/**/":"KEBAB_CASE",

        // Allow either __fixtures__ folder or kebab-case
        "test/**/":"(__fixtures__|+([a-z])*(-+([a-z0-9])))"
      }
    ]
  }
}

```


## Notes
This will not change dynamic imports paths (`import('<my-path>')`), You are welcome to create a PR
