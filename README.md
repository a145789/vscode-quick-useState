<h1 align="center">React Quick useState</h1>

<p align="center">
Quick generate React useState code
</p>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=clencat.react-quick-useState" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/clencat.react-quick-useState.svg?color=4d9375&amp;label=Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
</p>

# Usage

Enter `const ` to open the prompt, use __/__ to split code.


```ts
// input 
const count/0
// output
const [count, setCount] = useState(0)

// input 
const name/string/'John'
// output
const [name, setName] = useState<string>('John')

// input 
const arr/number[]/[]
// output
const [arr, setArr] = useState<number[]>([])

// input 
const fooBar/Foo | Bar/'foo'
// output
const [fooBar, setFooBar] = useState<Foo | Bar>('foo')
```

> 如果没显示提示，请键入 `/` 字符开启提示

> If no prompt is displayed, type the character `/` to enable the prompt
