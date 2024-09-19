
# Array based language

**A small programming language, based on arrays, inspired by Typescript's type system.**

*S. F. Jakobsen &lt;simonfromjakobsen@gmail.com&gt;, 12. September 2023*

I'd like to show an idea I got for a programming language.

It started with me experimenting with the type system in Typescript.

## Typescript's type system

To make this make sense, I'll have to explain a bit about typescript.

Typescript has a type system (WOW :exploding_head:!).
Typescript's type system contains some quite advanced features.
One such feature is its [generic type parameters (called "generics")](https://www.typescriptlang.org/docs/handbook/2/generics.html).
```ts
const foo = <T>(bar: T): T => bar;

foo<number>(123); // T = number
foo("foo"); // T = string
```
These generics can be constrained, such that we only allow a specific subset of types.
Typescript calls this [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).
```ts
const constrained = <T extends number>(a: T): T => a;

const c = constrained(123);
const d = constrained("abc"); // Argument of type 'string' is not assignable to parameter of type 'number'.
```
Another feature, is the variety of primitive types in Typescript.
```ts
const a: number = 123;
const b: 12 = 12;

const c: number[] = [1, 2, 3];
const d: [string, 123] = ["foo", 123];
```
Not represented here are the `any`, `void`, `unknown`, `never`, `null`, `undefined` types and object literal types, which are handy, but not necessary.
The local (name referring to variable or constant value) `b` is what Typescript calls [literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).
Literal types represent a specific value, eg. the `b` has the type `12`, meaning it'll only accept the value `12` specifically, not other numbers like `7`, `-123` or `3.14`; 
The local `a` is what Typescript calls [primitive types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean).
Primitives types are the set of all literal types of a class of values. For example, the type `number` is a type of the set of all numbers, meaning the local `a` can accept all number values such as `7`, `-123` or `3.14`.
The local `c` has an [array type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays), which is what you'd expect.
the local `d` has what Typescript calls [Tuple Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types).

Now these tuple types are quite interesting, as Typescript lets us do [array operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals) on them.
To see what I mean, let's first look at array operations on array values.
```ts
const a = [1, 2, 3];
const b = [...a, 4]; // [1, 2, 3, 4]
const c = [5, 6, 7];
const d = [...a, ...c]; // [1, 2, 3, 4, 5, 6]
```
Here we see a value being appended to an array, and arrays being concatonated into a new array containing the elements of both.

Now with tuple types, we can do the same on types.
```ts
type A = [any, any];
type B = [any, any, any];
type C = [...A, ...B]; // [any, any, any, any, any]
```
Now these types, we retrieve using generics too.
```ts
type C<A extends any[], B extends any[]> = [...A, ...b];
```
Now, what if we represent integers N, in terms of arrays, with a length of N.
And what if we rename `C` to `Add`.
```ts
type Add<Left extends any[], Right extends any[]> = [...Left, ...Right];

type A = [any, any, any]; // 3
type B = [any, any]; // 2
type Sym = Add<A, B>; // [any, any, any, any, any], ie. 2 + 3 = 5
```
Now wouldn't it also be nice if we had some way to do conditionals.
Consider the ternary operator on values.
```ts
const a = (b: number): string =>
    b === 5
        ? "b is five"
        : "b is not five";

const c = a(5); // "b is five";
const c = a(3); // "b is not five";
```
Typescript provides the same construct for types, in what they call [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html).
```ts
type A<B extends number> =
    B extends 5
        ? string
        : boolean;

let a: A<5> = "hello";
let b: A<4> = true;
let c: A<5> = false; // Type 'boolean' is not assignable to type 'string'.
```
Now we just need some way of doing iteration, luckily for us Typescript allows for recursive type definitions.
```ts
type Contains<V, VS extends any[]> =
    VS extends [infer C, ...infer Rest extends any[]]
        ? C extends V
            ? true
            : Contains<V, Rest>
        : false

type A = Contains<5, [1, 2, 3]>; // false
type B = Contains<"bar", ["foo", "bar", "baz"]>; // true
```
The quick ones among you would already have realized, that Typescript type system is [Turing complete as fuck](https://github.com/microsoft/TypeScript/issues/14833).
(Except for the recursion depth for type instantiations, which have [methods of partial mitigation](../techniques/improve_typescript_type_recursion_depth.md).)
This is because we conform to the 3 rules of a turing complete programming language, consisting of:
1. Sequence (we have recursion)
2. Selection (we have conditional)
3. Iteration (we have recursion)

Also notice the lack of ability to do anything, meaning no side effects, and the way type definitions are essentially functions, thus meaning, that what we have, is a purely functional programming language.

Now with this newly discovered Turing complete purely functional programming language of ours, that being Typescript's type system,
we could, for example, make a PEMDAS compliant calculator, including a full set of signed integer arithmetic operations add/subtract/multiply/divide/remainder/exponentiation, including comparison operators lt/lte/gt/gte/equal/not equal,
and of course a X86-64 generator for good measures. [And this is exactly what I did](https://gist.github.com/SimonFJ20/1bbfd17c323acb78ad46fef2af12d968).

![image](https://github.com/SimonFJ20/articles/assets/28040410/baf907d9-f535-4091-b8d2-4e5ccaaf9223)
![image](https://github.com/SimonFJ20/articles/assets/28040410/34bca835-96b6-4ac3-8618-5c292e7332c5)
![image](https://github.com/SimonFJ20/articles/assets/28040410/c1f3e2e2-6d7d-4986-9be7-98abeb3dcadb)

## Reflecting on Typescript

In this chaptor, I'll refer to Typescript's type system used as a programming language as just Typescript, and use *Typescript* to refer to the original definition. 

### The good

What do I like about Typescript:
- Simple
- Ergonomic syntax
- Small programs
- Composable

#### Simple

```ebnf
program ::= typeDefinitionStatement*
typeDefinitionStatement ::= "type" ID paramList?  "=" type
paramList ::= "<" seperatedList(param, ",") ">"
param ::= ID ("extends" pattern)?

pattern ::= objectPattern | tuplePattern | spreadPattern | literalType | ID | "infer" ID
objectPattern ::= uninteresting
tuplePattern ::= [pattern*]
spreadPattern ::= "..." pattern

type ::= optionalType | objectType | tupleType | arrayType | spreadType | literalType | ID
optionalType ::= param "?" type ":" type
objectType ::= uninteresting 
tupleType ::= [seperatedList(type, ",")]
arrayType ::= type[]
spreadType ::= "..." type
literalType ::= INT_LITERAL | STRING_LITERAL | "true" | "false" | "null" | "undefined"
```
The above is the [grammar of the parts of Typescript](https://stackoverflow.com/questions/12720955/is-there-a-formal-ideally-bnf-typescript-js-language-grammar-or-only-typescri) I'm interested in expressed in [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form).
This evidently represents a very simple language, but we've just seen that just this is Turing complete and, in my opinion, totally usable.

#### Ergonomic syntax

Look at the following code.

```ts
type A = [any, any, any];

type B<C extends any[]> =
    C extends [any, any, any]
        ? true
        : false

type D<A extends any[], E extends any[]> =
    B<A> extends true
        ? [...A, ...E]
        : E;

type F<A> = ...;
type MapF<List extends any[], Acc extends any[] = []> =
    List extends [infer Element, ...infer Rest extends any[]]
        ? MapF<Rest, [...Acc, F<Element>]>
        : Acc;
type Applied = MapF<[2, 3]>; // [F<2>, F<3>];
```
It's trivial to infer that `[any, any, any]` is a container with 3 elements, the elements all being `any` in this case.
The spread syntax is even simpler to deduce the behavior of.
I really like the tenary operator, as it's clear and concise.

#### Small programs

This is mostly anecdotal, as I haven't done much formal research on it.
But in my experience, programs written in this functional style tend to be a lot shorter,
than their imperitive equivalent.

#### Composable

Everything is either a value or a function.
There isn't a seperation between statements and expressions.
All subexpressions in an expression can be extracted out into it's own function.
This is generally a trait of functional programming languages.

### The bad

What do I not like about Typescript:
- The implementation
- No way of doing side effects
- No higher kinded types
- The rest of *Typescript*

#### The implementation

Typescript isn't inherently slow, just the fact that it's evaluated through *Typescript*'s type checker.

Without having done any scientific performance testing myself, I can say from experience, that even simple program using a bit of recursion can take several tens of seconds to evaluate.
Compare this to modern day Javascript in the browser and it's abysmally slow.

There's also the problem of recursion depth.

![image](https://github.com/SimonFJ20/articles/assets/28040410/26fec0ae-5376-4d9e-a25c-d4f981a2116b)

This limits the size of programs.
There are [ways to improve this](../techniques/improve_typescript_type_recursion_depth.md), but only slightly.

#### Side effects

Input is typed into the source code, output is retrieved by asking the language server, this isn't particularly practical.

The lack of side effects in general isn't necessarily bad, but the lack of any side effects limits the usecases a lot.
For example, there are no way to
- read a file
- write to a file
- host a web server
- send a web request
- print to the console
- get input from the console
- interact with a database

#### No higher kinded types

[*Typescript* does not suppert higher kinded types](https://github.com/microsoft/TypeScript/issues/1213).
We could've used them as lambda functions, implying polymorphism.
But in my experience, i haven't found the lack of parametric polymorphism to be crippling. It's just a nice to have.

#### The rest of Typescript

Having all the other features of *Typescript* in the languages, is obviously undesireable.

## A new language

Wouldn't it be nice to have all the good parts without the bad?
Yes, it would. Therefore let's make our own language with all the right ideas and none of the bad.

This isn't a complete specification, just a slightly technical description of the language.

The language is of the functional family, for example are values for the most part immutable.

### Expressions

#### Symbol

A symbol is an identifiable literal value.

Identifiable meaing two identical symbols are equal and two distinct symbols aren't, ie. `'a = 'a` and `'a != 'b`.

```re
/'[a-zA-Z0-9_]+/
```

```rs
'a
'123
'foo_bar
```

#### Array

A container for zero or more values.

```ebnf
arrayExpr ::= "[" expression* "]"
```
```rs
[]
['a 'b 'c]
[[] 'a ['a 'b]]
```
No comma seperation.

#### Integer literal

Integers are syntactic suger for arrays of a specific length.
```re
/0|[1-9][0-9]*/
```
```rs
5 // is equivalent to [_ _ _ _ _]
```

#### Character literal

Characters are syntactic suger for integers with the ascii/unicode representation.
```re
/'([^\\]|\\([0trn'"]|x[0-9a-fA-F]{2}))'/
```
```rs
'a' // is equivalent to 96
```

#### String literal

Strings are syntactic suger for arrays with characters.

```re
/"([^\\]|\\([0trn'"]|x[0-9a-fA-F]{2}))*"/
```
```rs
"hello" // is equivalent to ['h' 'e' 'l' 'l' 'o']
```

##### Spread

```ebnf
spreadPattern ::= ".." pattern
```
```rs
..v
[a b] // [[..] [..]]
[a ..b] // [[..] ..]
[..a b] // [.. [..]]
[..a ..b] // [.. ..]
```

##### Application/Call

```ebnf
callExpr ::= "(" expression+ ")"
```
```rs
(operator arg1 arg2)
(a)
(a b)
```

##### Conditional/If

```ebnf
if ::= "if" expression "=" pattern "?" expression ":" expression
```
```rs
if a = b
    ? c
    : d
```

`a`, `c` and `d` are expressions. `b` is a pattern optionally containing bound values.

##### Let/Binding

A binding of an identifier with zero or more parameters, to an expression.

```ebnf
let ::= "let" IDENTIFIER+ "=" expression ";" expression
```

```rs
let a = 5;
let b x = [x x];

a // 5
b // fn x = [x x]
(b 5) // [5 5]
```

##### Lambda

```ebnf
fn ::= "fn" IDENTIFIER* "=" expression
```

```rs
let my_lambda = fn a b = (add a b)

(my_lambda 2 3)
```

##### Pattern binding

```ebnf
pattern ::=  bind | spreadPattern | arrayPattern | groupPattern | IDENTIFIER | SYMBOL | INTEGER | CHARACTER | STRING
bind ::= "@" IDENTIFIER ("=" pattern)?
spreadPattern ::= ".." pattern
arrayPattern ::= "[" pattern* "]"
groupPattern ::= "(" pattern ")"
```

```rs
let sum values =
    if values = [@value ..@rest]
        ? value + (sum rest)
        : 0 // empty

(sum [1 2 3]) // 6
```

#### EBNF Grammar

```ebnf
program ::= expression

expression ::= let | fn | if | spreadExpr | arrayExpr | callExpr | groupExpr | IDENTIFIER | SYMBOL | INTEGER

let ::= "let" IDENTIFIER+ "=" expression ";" expression
fn ::= "fn" IDENTIFIER* "=" expression
if ::= "if" expression "=" pattern "?" expression ":" expression
spreadExpr ::= ".." expression
arrayExpr ::= "[" expression* "]"
callExpr ::= "(" expression+ ")"
groupExpr ::= "(" expression ")"

pattern ::=  bind | spreadPattern | arrayPattern | groupPattern | IDENTIFIER | SYMBOL | INTEGER | CHARACTER | STRING
bind ::= "@" IDENTIFIER ("=" pattern)?
spreadPattern ::= ..pattern
arrayPattern ::= [pattern*]
groupPattern ::= (pattern)

SYMBOL ::= /'[a-zA-Z0-9_]+/
IDENTIFIER ::= /[a-zA-Z_][a-zA-Z0-9_]*/
INTEGER ::= /[0-9]+/
CHARACTER ::= /'([^\\]|\\([0trn'"]|x[0-9a-fA-F]{2}))'/
STRING ::= /"([^\\]|\\([0trn'"]|x[0-9a-fA-F]{2}))*"/
```

## Example programs

### Hello world

```rs
"Hello, world!"
```
This programs will evaluate to the following.
```rs
"Hello, world!"
```

### FizzBuzz

```rs
let fizzbuzz n =
    if (mod n 15) = 'true
        ? "fizzbuzz"
    : if (mod n 3) = 'true
        ? "fizz"
    : if (mod n 5) = 'true
        ? "buzz"
        : (int_to_string(n));

(map fizzbuzz (range 1 100))
```
```rs
[1 2 "fizz" 4 "buzz" 6 ..]
```

### Calculator

```ml
let contains v vs =
    if vs = [@m ..@rest]
        ? if v = m
            ? true
            : (contains v rest)
        : false;

let tokenize_int text acc =
    if text = [@char ..@rest]
        ? if (contains char "0123456789") = 'true
            ? (tokenize_int rest [..acc char])
            : [text acc]
        : [text acc];

let tokenize text acc =
    if text = [@char ..@rest]
        ? if (contains char "0123456789") = 'true
            ? if tokenize_int text [] = [@rest @value]
                ? (tokenize rest [..acc ['int value]])
                : 'never
            : if (contains char "+-*/()") = 'true
                ? (tokenize rest [..acc ['operator char]])
                : (tokenize rest [..acc ['invalid char]])
        : acc;

let parse_group tokens =
    if tokens = [..@rest]
        ? if (parse_expr rest) = [@expr @rest]
            ? if rest = [['operator ')'] ..@rest]
                ? [expr rest]
                : ['error "expected ')'"]
            : 'never
        : ['error "expected expression"];

let parse_operand tokens =
    if tokens = [['int value] ..@rest]
        ? [['int value] rest]
        : if tokens = [['operator '('] ..@rest]
            ? (parse_group rest)
            : ['error "expected operand"];

let parse_unary tokens =
    if tokens = [['operator '-'] ..@rest]
        ? if (parse_unary) = [@expr @rest]
            ? [['negate expr] rest]
            : 'never
        : (parse_operand tokens);

let parse_factor tokens left =
    if left = 'null
        ? if (parse_unary tokens) = [@left @rest]
            ? (parse_factor rest left)
            : 'never
        : tokens = [['operator '*'] ..@rest]
            ? if (parse_unary rest) = [@right @rest]
                ? (parse_factor rest ['multiply left right])
                : 'never
            : tokens = [['operator '/'] ..@rest]
                ? if (parse_unary rest) = [@right @rest]
                    ? (parse_factor rest ['divide left right])
                    : 'never
                : [left tokens];

let parse_term tokens left =
    if left = 'null
        ? if (parse_factor tokens 'null) = [@left @rest]
            ? (parse_term rest left)
            : 'never
        : tokens = [['operator '+'] ..@rest]
            ? if (parse_factor rest 'null) = [@right @rest]
                ? (parse_term rest ['add left right])
                : 'never
            : tokens = [['operator '-'] ..@rest]
                ? if (parse_factor rest 'null) = [@right @rest]
                    ? (parse_term rest ['subtract left right])
                    : 'never
                : [left tokens];

let parse_expr tokens = (parse_term token 'null);

let parse tokens =
    if (parse_expr tokens) = [@expr []]
        ? expr
        : 'never;

let evaluate expr =
    if expr = ['int @value]
        ? value
    : if expr = ['negate @inner]
        ? (neg (evaluate inner))
    : if expr = ['add @left @right]
        ? (add (evaluate left) (evaluate right))
    : if expr = ['subtract @left @right]
        ? (sub (evaluate left) (evaluate right))
    : if expr = ['multiply @left @right]
        ? (mul (evaluate left) (evaluate right))
    : if expr = ['divide @left @right]
        ? (div (evaluate left) (evaluate right))
    : 'never;

let calculate text = (evalute (parse (tokenize text)));

(calculate "1 + 2 * (3 + 4) + -5")
```
```rs
10
```

## Additional features

There are a few features I feel would make the language even better, although this would increase complexity of the language.

### Happy path pattern matching

```rs
let unwrap v =
    if v = ['optional @value]
        ? value
        : 'never;
```

The `'never` in this case is arbitrarily selected.
A better solution in my opinion, would be to have some syntax like this:
```rs
let unwrap v =
    let ['optional @value] = v
        in value;
``` 
In this case, if the value does not match the pattern, the program will halt in a standardized manner,
instead of situations like this having to be managed on an individual case by case basis by the user.

### Multiple matches

```rs
let evaluate expr =
    if expr = ['int @value]
        ? value
    : if expr = ['negate @inner]
        ? (neg (evaluate inner))
    : if expr = ['add @left @right]
        ? (add (evaluate left) (evaluate right))
    : if expr = ['subtract @left @right]
        ? (sub (evaluate left) (evaluate right))
    : if expr = ['multiply @left @right]
        ? (mul (evaluate left) (evaluate right))
    : if expr = ['divide @left @right]
        ? (div (evaluate left) (evaluate right))
    : 'never;
``` 

I've found that `if`-syntax is often impractical for matching operations containing multiple alternatives.
Instead, I'd like a syntax like [Rust's Match expressions](https://doc.rust-lang.org/reference/expressions/match-expr.html).

```rs
let evaluate expr =
    match expr
        ? ['int @value] : value
        ? ['negate @inner] : (neg (evaluate inner))
        ? ['add @left @right] : (add (evaluate left) (evaluate right))
        ? ['subtract @left @right] : (sub (evaluate left) (evaluate right))
        ? ['multiply @left @right] : (mul (evaluate left) (evaluate right))
        ? ['divide @left @right] : (div (evaluate left) (evaluate right));
```
Again, if the expression doesn't match, the program halts in a standardized manner.

The `match`-syntax could also be used for happy path matching, like in the following example.
```rs
let unwrap v =
    match v
        ? ['optional @value] : in value;
```

### Nested bound patterns

```rs
let a = 
    if a = [@outer = [@inner_a @inner_b]]
        ? [outer inner_a inner_b]
        : 'never;

(a [1 2]) // [[1 2] 1 2]
```

### Currying

Being able to partially apply a function, can sometimes be useful.
The following is an example of [Currying](https://en.wikipedia.org/wiki/Currying).

```rs
let add_five = (add 5);

add_five // fn right = (add 5 right)

(add_five 3) // 8
(add_five 5) // 10
```

## Static types

The described languages does not have any proper sense of static typing, and is in fact dynamically typed.

This has some benefits in terms of implementation.
The lack of static typing simplifies the whole interpretation process, for example
- less syntax needs to be parsed,
- no type checker is needed,
- and no complexities surrounding for example sum types.

Some would even argue, that dynamic typing is more effective for fast software development.
Others, myself included, argue that soundly type checked code is far easier to read and maintain,
and expressive types aid in design.
I haven't found conclusive research for either.

There are some downsides of dynamic typing, such as greater difficult in [AOT](https://en.wikipedia.org/wiki/Ahead-of-time_compilation) optimization and compilation.
Compiling to optimized machine code requires information only available in runtime, meaning only a [JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation) compiler will suffice.

## Side effects

Instead of addressing side effects conclusively in this article, I have chosen to defer it to a later one.

There are 3 methods of achieving side effects in this language, as I see it.

### OCaml-like allowing side effects and discarding values

In OCaml, you can write [the following syntax](https://cs3110.github.io/textbook/chapters/basics/printing.html#printing).
```ocaml
let _ = print_endline "Foo" in
    print_endline "Bar"
```
This will print the following.
```
Hello
World
```
OCaml has a shorthand for `let _ = ... in ...`, the `;` (semicolon) operator.
```ocaml
print_endline "Foo";
print_endline "Bar"
```

```ml
let main =
    (println "What's your name?"); // this expression gets discarded
    if (readln) = @name
        ? (println (concat "Hello " name))
        : 'never;
(main)
```

The same could be implemented for this language.

### Haskell-like monads

By introducing a new data type, a few builtin functions, a bit of runtime support, and possibly a bit of syntax,
we can have the best of both worlds. We can have a pure functions and values languages, while still being able to produce side effects, with the help of [monads](https://en.wikipedia.org/wiki/Monad_(functional_programming)).

In Haskell we can write [the following](https://www.haskell.org/tutorial/io.html).
```hs
main :: IO
main = do
    putStrLn "What's your name?"
    name <- readLine
    putStrLn ("Hello " ++ name)
```
This is syntax sugar for the following.
```hs
main :: IO
main = (putStrLn "What's your name?")
    `>>=` readLine
        `>>=` (\x -> putStrLn ("Hello " ++ name))
```
`>>=` is the bind operator.

By introducing some of the features in this languages, such as the `bind` function, the abstract IO data type,
and provide functions such as `println` and `readln` returning the IO data type, we can write the following in our language.
```ml
let main =
    (bind (println "What's your name?")
        (fn _ = bind (readln)
                (fn name = (println (concat "Hello " name)))));
(main)
```
The above example isn't exactly pretty, so let's try and introduce some syntax-suger for making it prettier.
```ml
let main = do [
    (println "What's your name?");
    let name = (readln);
    (println (concat "Hello " name));
];
```
Here, the `do`-syntax takes a list of IO values, and bind them together, the same way the `bind` function would.
The notation ignores the return value, if no `let ... =` is put in front of the expression,
compared to the prior example, where we explicitly have to say `fn _ =`.

### Monads through semantic values

Instead of the IO data type, being some magical abstract type, we can instead just introduce some semantic values in the runtime.

What do I mean by semantic values?
When the following expression evaluates, it will produce the value that follows.
```ml
['a 12]
```
```
['a 12]
```
If, instead of relaying all values back to the user, the runtime looks at the values, and determines if they should be further evaluated.
For example, consider the following redefinition of `println`.
```ml
let println v = ['io 'println v];
```
When the following call is evaluated, it will produce the value that follows.
```ml
(println "foo bar")
```
```ml
['io 'println "foo bar"]
```
If we then encode the value pattern in the runtime, we can make it perform the side effect, and print the following to the console.
```
foo bar
```
Using lambdas, we can do the same with the other monadic and side effectious operations.
```ml
let bind a f = ['io 'bind a f];

let readln = ['io 'readln];
```
We can now do the following.
```ml
let main =
    (bind (println "What's your name?")
        (fn _ = bind (readln)
                (fn name = (println (concat "Hello " name)))));
(main)
```
This will produce the following value directly.
```ml
[
    'io 'bind
    ['io 'println "What's your name?"]
    fn _ = [
        'io 'bind
        ['io 'readln]
        fn name = ['io 'println (concat "Hello " name)]
    ]
]
```
The runtime can now recognize and further evaluate the value above, and produce the desired side effects.

## Builtin/standard library

I have not decided on the style and extent of the built in functions and standard provided functions.
The vast majority of functions can be implemented by using the provided constructs.
For an example of this, look at the following example of an `add` function.
```ml
let add left right = [..left ..right];
```
Since integers are syntax suger for arrays with a specified length, this function is valid.

There are however downsides to constructing the majority of *low level*-functions in the languages itself, such as the massive overhead compared to builtin functions.
An example of the massive difference overhead, look at the following in-language definition of `mul` (multiply).
```ml
let mul_internal left right acc =
    if left extends [_ ..@rest]
        ? (mul_internal rest right [..acc ..right])
        : acc;

let mul left right = (mul_internal left right [])
```
If we visually evaluate `(mul 3 4)` (`3 * 4`) by means of substitution, we get the following execution.
```ml
(mul 3 4)
(mul [_ _ _] [_ _ _ _])
(mul_internal [_ _ _] [_ _ _ _] [])
if [_ _ _] extends [_ ..@rest] ? (mul_internal rest [_ _ _ _] [..[] ..[_ _ _ _]]) : []
(mul_internal [_ _] [_ _ _ _] [_ _ _ _])
if [_ _] extends [_ ..@rest] ? (mul_internal rest [_ _ _ _] [..[_ _ _ _] ..[_ _ _ _]]) : [_ _ _ _]
(mul_internal [_] [_ _ _ _] [_ _ _ _ _ _ _ _])
if [_] extends [_ ..@rest] ? (mul_internal rest [_ _ _ _] [..[_ _ _ _ _ _ _ _] ..[_ _ _ _]]) : [_ _ _ _ _ _ _ _]
(mul_internal [] [_ _ _ _] [_ _ _ _ _ _ _ _ _ _ _ _])
if [] extends [_ ..@rest] ? (mul_internal rest [_ _ _ _] [..[_ _ _ _ _ _ _ _ _ _ _ _] ..[_ _ _ _]]) : [_ _ _ _ _ _ _ _ _ _ _ _]
[_ _ _ _ _ _ _ _ _ _ _ _]
```
As evident, a multiply operation done this way, is in fact, not very efficient.
Even with a few simple optimizations, this is still painfully slow, compared to a builtin function doing the same.
Especially with the same optimizations enabled.

## Implementation

I'm working on a quite naive interpreter written in Typescript.
It is by no means feature complete, nor super optimized. I'll therefore choose to defer implementation to a future article.

## Inspiration

This language was, as stated before, primarily inspired by Typescript's type system.

The syntax is heavily inspired by ML family languages, such as [SML](https://en.wikipedia.org/wiki/Standard_ML), [OCaml](https://ocaml.org/docs/data-types) and [F#](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/).

Compared to it's inspiring languages, this languages is a lot simpler. There's less syntax, less features, less semantics and less syntax suger.

## Conclusion

What we have here, is a simple language, which is 
- simple to understand,
- simple to specify,
- simple to implement interpreters for
- and I'd argue, simple to program in.

There are no implicit conversions of types, no hard to see null dereferences and no invisible exceptions.
The code is mathematically sound and doesn't expose unnecessary low level control, prone to bugs and security vulnurabilities.
The semantics are simple to reason about. There are no data races, no dangling pointers, no unfreed memory, no hard-to-refactor global variables.

I think simple languages like this have potential for improving developer experience, compared to the modern day jack-of-all-trades languages,
which have massive syntaxes, incredible difficult to reason about semantic, and take years to become proficient in.

## Sources

- [Jakobsen, S. F. *Improve Typescript type recursion depth*](#appendix-1-improve-typescripts-type-recursion-limit)
- [Jakobsen, S. F. *A PEMDAS Compliant Math Parser implemented entirely in Typescript's Type System*](https://gist.github.com/SimonFJ20/1bbfd17c323acb78ad46fef2af12d968)
- [Clarkson, M. R. *OCaml Programming: Correct + Efficient + Beautiful*](https://cs3110.github.io/textbook/chapters/basics/printing.html#printing)
- [Hudak, P., Peterson, J., Fasel, J. *A Gentle Introduction to Haskell* Version 98](https://www.haskell.org/tutorial/io.html)
- [GitHub, microsoft/TypeScript *TypeScripts Type System is Turing Complete* #14833](https://github.com/microsoft/TypeScript/issues/14833)
- [GitHub, microsoft/TypeScript *Allow classes to be parametric in other parametric classes* #1213](https://github.com/microsoft/TypeScript/issues/1213)
- [MDN Web Docs *Spread syntax*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals)
- [Typescript *Handbook*](https://www.typescriptlang.org/docs/handbook/intro.html)
- [The Rust Reference *`match` expressions*](https://doc.rust-lang.org/reference/expressions/match-expr.html)
- [OCaml Documentation](https://ocaml.org/docs/data-types)
- [Microsoft *F# Language Reference*](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/)
- [Wikipedia, *Extended Backus-Naur form (EBNF)*](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form)
- [Wikipedia *Currying*](https://en.wikipedia.org/wiki/Currying)
- [Wikipedia *Ahead-of-time compilation (AOT)*](https://en.wikipedia.org/wiki/Ahead-of-time_compilation)
- [Wikipedia *Just-in-time compilation (JIT)*](https://en.wikipedia.org/wiki/Just-in-time_compilation)
- [Wikipedia *Monad*](https://en.wikipedia.org/wiki/Monad_(functional_programming))
- [Wikipedia *Standard ML*](https://en.wikipedia.org/wiki/Standard_ML)
- [Stackoverflow, *Is there a formal (ideally BNF) typescript js language grammar (or only typescript subset)?*](https://stackoverflow.com/questions/12720955/is-there-a-formal-ideally-bnf-typescript-js-language-grammar-or-only-typescri)

# Appendix 1 - Improve Typescript's type recursion limit

![image](https://github.com/SimonFJ20/articles/assets/28040410/35b641ac-664a-4326-af0b-232d6d730069)

## Lazy constraints

Rewrite
```ts
type A<B extends number> = ...; 
```
into
```ts
type A<B> ?
    [B] extends [infer B extends number] 
        ? ...
        : never;
```
because for some reason, this increases the max depth.
