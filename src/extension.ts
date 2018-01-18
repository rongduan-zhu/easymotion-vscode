import { ExtensionContext, TextEditor, window, Range, Position, commands } from 'vscode';

interface IMatches {
    line: number;
    matches: number[];
}

export function activate(context: ExtensionContext) {
    let easyMotionDisposable = commands.registerCommand('extension.easyMotion', highlightNearbyChars);

    context.subscriptions.push(easyMotionDisposable);
}

export function deactivate() {
}

const searchContext = 50; // Search 50 lines above and below the current line

function highlightNearbyChars(): void {
    let editor = window.activeTextEditor;

    window.showInputBox().then(input => {
        let cursorPosition = editor.selection.active;
        let document = editor.document;

        if (!input || !cursorPosition) {
            return;
        }

        let startRow = max(cursorPosition.line - searchContext, 0);
        let endRow = min(cursorPosition.line + searchContext, document.lineCount - 1);
        let searchContent = document.getText(new Range(
            new Position(startRow, 0),
            new Position(endRow, document.lineAt(endRow).text.length)
        )).split('\n');
        let matches = findMatches(searchContent, input);

        console.log(JSON.stringify(matches, undefined, 2));
    });
}

function findMatches(lines: string[], term: string): IMatches[] {
    return lines.map((text: string, lineNumber: number) => {
        let matches: number[] = [];

        while (text) {
            let index = text.indexOf(term);

            if (index === -1) {
                break;
            }

            matches.push(index);
            text = text.substr(index + 1);
        }

        return {
            line: lineNumber,
            matches
        };
    });
}

function min(a: number, b: number): number {
    return a < b ? a : b;
}

function max(a: number, b: number): number {
    return a < b ? b : a;
}
