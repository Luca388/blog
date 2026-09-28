®
```json

//launch.json
{
    "version": "0.2.0",
    "configurations": [
      {
        "name": "clang++ - Build and debug active file",
        "type": "cppdbg",
        "request": "launch",
        "program": "${fileDirname}/${fileBasenameNoExtension}",
        "args": [],
        "stopAtEntry": false,
        "cwd": "${workspaceFolder}",
        "environment": [],
        "externalConsole": true,
        "MIMode": "lldb",
        "preLaunchTask": "C/C++: clang++ build active file"
      }
    ]
  }
```


```json
// task.json
{
    "version": "2.0.0",
    "tasks": [
      {
        "type": "cppbuild",
        "label": "C/C++: clang++ build active file",
        "command": "/usr/bin/clang++",
        "args": [
          "-std=c++17",
          "-stdlib=libc++",
          "-g",
          "${file}",
          "-o",
          "${fileDirname}/${fileBasenameNoExtension}"
        ],
        "options": {
          "cwd": "${fileDirname}"
        },
        "problemMatcher": ["$gcc"],
        "group": {
          "kind": "build",
          "isDefault": true
        },
        "detail": "Generated build task by launch.json"
      }
    ]
  }
```