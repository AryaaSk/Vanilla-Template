#!/usr/bin/env node

var fs = require('fs');

fs.mkdirSync("Assets"); //make folders
fs.mkdirSync("Src");

fs.writeFileSync("Src/index.html",
`<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index</title>
    <script src="/.JS/script.js" defer></script>
</head>
<body>
</body>
</html>`
);
fs.writeFileSync("Src/script.ts",
`console.log("Hello Template");`
);

fs.writeFileSync(".gitignore", 
`#When adding a item to gitignore, need to remove and retrack all files in git:
# git rm -r --cached .
# git add .

#Generated files
/dist
/.firebase

#System Files
.DS_Store`
);

fs.writeFileSync("build.py",
`#Run this to build the entire project into a single dist folder
#Make sure the latest version of the TS files are compiled to the _JS folder
#Also make sure that no files have the same name, since they all end up in a singular directory

srcFolder = "./Src" #html + css
compiledJSFolder = "./.JS"
assetsFolder = "./Assets"

import os
import fnmatch
import shutil

class File:
    path: str
    name: str
    type: str
    def __init__(self, path, name, type):
        self.path = path
        self.name = name
        self.type = type

filePaths: list[File] = []

#Get files from Src folder and _JS folder
for path,dirs,files in os.walk(srcFolder):
    for file in fnmatch.filter(files, '*.html'):
        filePaths.append(File(f"{path}/{file}", file, "html"))
    for file in fnmatch.filter(files, '*.css'):
        filePaths.append(File(f"{path}/{file}", file, "css"))
    for file in fnmatch.filter(files, '*.json'):
        filePaths.append(File(f"{path}/{file}", file, "json"))
for path,dirs,files in os.walk(compiledJSFolder):
    for file in fnmatch.filter(files, '*.js'):
        filePaths.append(File(f"{path}/{file}", file, "js"))

#Generate SearchFor and ReplaceWith strings (just the file paths to be replaced)
class FilePath:
    searchFor: str
    replaceWith: str
    def __init__(self, searchFor, replaceWith):
        self.searchFor = searchFor
        self.replaceWith = replaceWith

searchReplace: list[FilePath] = []
for file in filePaths:
    srcPath = file.path[1:]
    destPath = f"{file.name}"
    searchReplace.append(FilePath(srcPath, destPath))
searchReplace.append(FilePath(assetsFolder[1:], "Assets/")) #just remove the first blackslash, since we will just copy the entire assets directory into the dist folder

if os.path.isdir('dist/'): #delete and generate new dist folder if it already exists (to clear contents)
    shutil.rmtree('dist/')
os.mkdir("dist/")


#Add / Modify files, into a dist folder
for file in filePaths:
    srcPath = file.path
    destPath = f"dist/{file.name}"

    if (file.type == "asset"): #don't interfere with file if it is an asset
        shutil.copy2(srcPath, destPath)
        continue

    f = open(srcPath, "r")
    try:
        lines = f.readlines()
    except:
        print(f"Unable to parse file: {srcPath}")
    f.close()

    fileString = "" #we need to modify this data, especially the <script> tags in the HTML
    for line in lines:
            #for each line of the file, we need to try and replace all the paths in searchReplace
            for path in searchReplace:
                line = line.replace(path.searchFor, path.replaceWith)

            fileString += line
        
        

    f = open(destPath, 'w')
    f.write(fileString)
    f.close()

#Finally just copy the assests folder into the dist directory
shutil.copytree(assetsFolder, "dist/Assets")

print("Successfully built project, output is in the dist folder")`
);

fs.writeFileSync("README.md",
`# Vanilla Template
### A basic template to build vanilla JS projects, comes with a project structure and a build process.

## To start development:
Go to project root and type in terminal:
\`\`\`
live-server
\`\`\`

Start typescript compilation:
\`\`\`
npx tsc-watch
\`\`\`

*Make sure you have live-server and typescript installed globally from NPM.*

## To build
Go to project root and type in terminal:
\`\`\`
python3 build.py
\`\`\`

*Make sure you have python installed, as well as the dependencies that [Build.py](build.py) requires.*

## Notes
- You must give each Src file its own unique name if they are the same extension, for example you cannot have 2 index.html.
- This is because all the files get put into a single dist folder so if 2 files have the same name one will get overwritten.
- To use assets you can use their absolute path relative to the project's root, it will get updated when being build for dist. 
- Here is an example if there was an image in the assets folder and I wanted to access it from a Src file:
\`\`\`html
<img src="/Assets/image.png">
\`\`\``
);

fs.writeFileSync("tsconfig.json",
`{
    "compilerOptions": {
        "target": "es2022",  
        "module": "commonjs",   
        "outDir": ".JS",   
        "esModuleInterop": true,   
        "forceConsistentCasingInFileNames": true,  
        "strict": true,   
        "skipLibCheck": true 
    }
}`
);