<h1 align="center">React Quick useState</h1>

Quick generate `React useState` code

<p align="center">

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
