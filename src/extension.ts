import * as vscode from "vscode";

const reg = /^([a-zA-Z\_\$][\w\$]*)(\.([\[\]\{\}\:\w\<\>\|\&]+)){0,1}(\.(.*)){0,1}$/g;
class MyCompletionItemProvider implements vscode.CompletionItemProvider {
  private position?: vscode.Position;
  private str = "";

  constructor() {}

  // 提供代码提示的候选项
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    this.position = position;
    console.log(document
      .lineAt(position)
      .text);
    
    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character);

    if (!linePrefix?.startsWith("const ") || !linePrefix.split("const ")[1]) {
      this.str = "";
      return [];
    }

    for (const iterator of linePrefix.split("const ")[1].matchAll(reg)) {
      const [_1, name, _2, type, _3, value] = iterator;
      this.str =
        "const [" +
        name +
        ", set" +
        name.replace(name[0], name[0].toUpperCase()) +
        "] = useState";

      if (type) {
        if (!value) {
          this.str += `(${type})`;
        } else {
          if (type === "<" || type === '<>') {
            this.str += "<>";
          } else {
            this.str += `<${type}>`;
          }
        }
      }

      if (value) {
        this.str += `(${value})`;
      } else if (!type) {
        this.str += "()";
      }
    }

    console.log(this.str,linePrefix);
    
    const snippetCompletion = new vscode.CompletionItem(
      linePrefix,
      vscode.CompletionItemKind.Snippet
    );

    snippetCompletion.detail = this.str;
    return [snippetCompletion];
  }

  // 光标选中当前自动补全item时触发动作
  public resolveCompletionItem(item: vscode.CompletionItem) {
    // const label = item.label;
    // if (this.position && typeof label === "string") {
    //   item.command = {
    //     command: "vscode-extension.quick-useState",
    //     title: "refactor",
    //     arguments: [this.position.translate(0, label.length + 1), this.str], // 这里可以传递参数给该命令
    //   };
    // }

    // return item;
    return null;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = "vscode-extension.quick-useState";
  const commandHandler = (
    editor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
    position: vscode.Position,
    str: string
  ) => {
    const lineText = editor.document.lineAt(position.line).text;

    edit.delete(
      new vscode.Range(
        position.with(undefined, 0),
        position.with(undefined, lineText.length)
      )
    );

    edit.insert(position.with(undefined, 0), str);

    return Promise.resolve([]);
  };
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(commandId, commandHandler)
  );

  const disposable = vscode.languages.registerCompletionItemProvider(
    ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue"],
    new MyCompletionItemProvider()
  );

  context.subscriptions.push(disposable);
}
