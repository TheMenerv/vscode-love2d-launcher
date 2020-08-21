'use strict';
import * as vscode from 'vscode';
var exec = require('child_process').execFile;
let currentInstances = [];
let output: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    var maxInstances = vscode.workspace.getConfiguration('love2DLauncher').get('maxInstances');
    var overWrite = vscode.workspace.getConfiguration('love2DLauncher').get('overWrite');
    output = vscode.window.createOutputChannel("Löve2D Launcher");

    let disposable = vscode.commands.registerCommand('love2DLauncher.launch', () => {
        if(currentInstances.length < maxInstances || overWrite){
            var path : string = vscode.workspace.getConfiguration('love2DLauncher').get('path').toString();
            var useConsoleSubsystem = vscode.workspace.getConfiguration('love2DLauncher').get('useConsoleSubsystem');
            var saveAllOnLaunch = vscode.workspace.getConfiguration('love2DLauncher').get('saveAllOnLaunch');
            var clearOutputOnLaunch = vscode.workspace.getConfiguration('love2DLauncher').get('clearOutputOnLaunch');

            if (saveAllOnLaunch){
                vscode.workspace.saveAll();
            }

            if (overWrite){
                currentInstances.forEach(function(instance){
                    if (instance != undefined){
                        instance.kill();
                    }
                });
            }

            if(!useConsoleSubsystem){

                output.show(true);
                
                if (clearOutputOnLaunch){
                    output.clear()
                }

                var process = exec(path, [vscode.workspace.rootPath]);

                process.stdout.on('data', function(data) {
                    output.append(data.toString());
                })

                process.on('close', (code) => {
                    output.append(`Process exited with code ${code}`);
                });

                process.on('exit', on_exit.bind(null,process));

                currentInstances[process.pid] = process;
            }else{
                var process = exec(path, [vscode.workspace.rootPath, "--console"], function (err, data) {
                    
                });
                process.on('exit', on_exit.bind(null,process));
                currentInstances[process.pid] = process;
            }
        }else{
            vscode.window.showErrorMessage("You have reached your max concurrent Löve instances. You can change this setting in your config.");
        }

    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function on_exit(oProcess){
    currentInstances.splice(oProcess.pid, 1);
    currentInstances = currentInstances.filter(Boolean);
}
