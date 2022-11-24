import * as vscode from "vscode";

const WRAPPING_TRIGGER_CHARACTERS = ['{', '}', '[', ']', '(', ')', '\'', '"'] as const;
const TRIGGER_CHARACTERS = [...WRAPPING_TRIGGER_CHARACTERS, '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;


function genValue(text: string) {
  const [startChar, endChar] = text.length === 1 ? [text[0], null] : [text[0], text[text.length - 1]];

  if (!(WRAPPING_TRIGGER_CHARACTERS as readonly string[]).includes(startChar) || startChar === endChar) {
    return text;
  }

  switch (startChar) {
    case '"':
    case '\'':
      return text + startChar;
    case '{':
      return text + '}';
    case '[':
      return text + ']';
    case '(':
      return text + ')';

    default:
      return text;
  }
}

class MyCompletionItemProvider implements vscode.CompletionItemProvider {
  private position?: vscode.Position;
  private str = "";

  constructor() { }

  // 提供代码提示的候选项
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    this.position = position;

    const linePrefix = document
      .lineAt(position).text.slice(0, position.character)?.trimStart() || '';

    if (!linePrefix.startsWith("const ") || !linePrefix.split("const ")[1] || linePrefix.indexOf("=") > -1) {
      this.str = "";
      return [];
    }

    const [name, type, value] = linePrefix.split("const ")[1].split('/');
    this.str =
      "const [" +
      name +
      ", set" +
      name.replace(name[0], name[0].toUpperCase()) +
      "] = useState";

    if (type) {
      if (!value) {
        this.str += `(${genValue(type)})`;
      } else {
        if (type === "<" || type === '<>') {
          this.str += "<>";
        } else {
          this.str += `<${type}>`;
        }
      }
    }

    if (value) {
      this.str += `(${genValue(value)})`;
    } else if (!type) {
      this.str += "()";
    }

    const snippetCompletion = new vscode.CompletionItem(
      linePrefix,
      vscode.CompletionItemKind.Snippet
    );

    snippetCompletion.documentation = this.str;
    snippetCompletion.detail = 'enter / split code';
    snippetCompletion.range = new vscode.Range(new vscode.Position(position.line, position.character), new vscode.Position(position.line, position.character));

    snippetCompletion.filterText = '';

    return [snippetCompletion];
  }

  // 光标选中当前自动补全item时触发动作
  public resolveCompletionItem(item: vscode.CompletionItem) {
    const label = item.label;
    if (this.position && typeof label === "string") {
      item.command = {
        command: "vscode-extension.quick-useState",
        title: "refactor",
        arguments: [this.position.translate(0, label.length + 1), this.str], // 这里可以传递参数给该命令
      };
    }

    return item;
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
    const startSpaces = lineText.length - lineText.trimStart().length;

    edit.delete(
      new vscode.Range(
        position.with(undefined, startSpaces),
        position.with(undefined, lineText.length)
      )
    );

    edit.insert(position.with(undefined, startSpaces), str);

    return Promise.resolve([]);
  };
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(commandId, commandHandler)
  );

  const disposable = vscode.languages.registerCompletionItemProvider(
    ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue", "html"],
    new MyCompletionItemProvider(),
    ...TRIGGER_CHARACTERS
  );

  context.subscriptions.push(disposable);
}
