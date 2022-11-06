import * as vscode from "vscode"

class MyCompletionItemProvider implements vscode.CompletionItemProvider {
  private position?: vscode.Position
  private str = ""

  constructor() {}

  // 提供代码提示的候选项
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    this.position = position

    const linePrefix = document
      .lineAt(position)
      .text.slice(0, position.character)

    console.log("test", linePrefix)
    if (!linePrefix?.startsWith("const ") || !linePrefix.split("const ")[1]) {
      return undefined
    }

    for (const iterator of linePrefix
      .split("const ")[1]
      .matchAll(
        /^([a-zA-Z\_\$][\w\$]*)(\<([\w\{\}\[\]\:])*){0,1}(\((.)*\){0,1}){0,1}$/g
      )) {
      const [_1, name, type, _2, value] = iterator
      this.str =
        "const [" +
        name +
        ", set" +
        name.replace(name[0], name[0].toUpperCase()) +
        "] = useState"

      if (type) {
        if (type.length === 1) {
          this.str += "<>"
        } else {
          this.str += type + ">"
        }
      }

      if (value) {
        if (value.endsWith(")")) {
          this.str += value
        } else {
          this.str += value + ")"
        }
      } else {
        this.str += "()"
      }
    }

    const snippetCompletion = new vscode.CompletionItem(
      this.str,
      vscode.CompletionItemKind.Operator
    )
    snippetCompletion.documentation = new vscode.MarkdownString(
      "quick useState result"
    )

    return [snippetCompletion]
  }

  // 光标选中当前自动补全item时触发动作
  public resolveCompletionItem(item: vscode.CompletionItem) {
    const label = item.label
    if (this.position && typeof label === "string") {
      item.command = {
        command: "vscode-extension.log",
        title: "refactor",
        arguments: [this.position.translate(0, label.length + 1), this.str], // 这里可以传递参数给该命令
      }
    }

    return item
  }
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = "vscode-extension.log"
  const commandHandler = (
    editor: vscode.TextEditor,
    edit: vscode.TextEditorEdit,
    position: vscode.Position,
    str: string
  ) => {
    const lineText = editor.document.lineAt(position.line).text

    edit.delete(
      new vscode.Range(
        position.with(undefined, 0),
        position.with(undefined, lineText.length)
      )
    )

    edit.insert(position.with(undefined, 0), str)

    return Promise.resolve([])
  }
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(commandId, commandHandler)
  )

  const disposable = vscode.languages.registerCompletionItemProvider(
    [
      "html",
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
      "vue",
    ],
    new MyCompletionItemProvider(),
    "." // 注册代码建议提示，只有当按下“.”时才触发
  )

  context.subscriptions.push(disposable)
}
