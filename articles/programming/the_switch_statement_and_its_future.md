
S. F. Jakobsen &lt;simonfromjakobsen@gmail.com&gt;, 27. September 2023

# The switch-statement and its future

The switch-statement and it's consequences have been a disaster for the discipline of programming.

Now what do I mean by this? Let's remind ourselves what the switch-statement is.

## What is a switch-statement

To explain the construct, we have to look a bit at some assembly.

```asm
example:
    ; ...
    call traffic_light_color
```
Now `eax` contains the color of the traffic light, represented as either `1`, `2` or `3`, representing `red`, `yellow` and `green` respectively.
Now we have to make some decision depending on the result.
If it's green, we'll drive. If it's red, we'll stop, if it's green we'll go and if it's yellow, we'll put it in 2nd gear and go anyway.
```asm
%define RED 1
%define YELLOW 2
%define GREEN 3
    cmp eax, RED
    je .case_red ; je = jump if equal
    cmp eax, YELLOW
    je .case_yellow
    cmp eax, GREEN
    je .case_green
    jmp .break
.case_red:
    ; stop car somehow
    jmp .break
.case_yellow:
    ; put in 2nd gear somehow
    ; notice no jmp .break
.case_green:
    ; don't stop the car or something idk, maybe this isn't the best analogy
.break:
    ; ...
```
Does this look familiar? Yes? That's because it is.
Let's look at a switch-statement from C.
```c
#define RED 1
#define YELLOW 2
#define GREEN 3

void example(void)
{
    int color = traffic_light_color();
    switch (color) {
        case RED:
            // stop car somehow
            break;
        case YELLOW:
            // put in 2nd gear somehow
            // notice no break
        case GREEN:
            // don't stop car or something idk, maybe this isn't the best analogy
    }
    // ...
}
```

It's the same thing. There's literally no difference.
It's a one-to-one mapping.

## Matching

By far the most common use case for the switch-statement, is for *matching* a value.

Meaning either matching a value with some assocated action:

```c
int value = get_input();
switch (value) {
    case 1:    
    case 2:    
    case 3:
        printf("too low\n");
        break;
    case 4:
        printf("👉👈😳\n");
        break;
    case 5:    
    case 6:    
    case 7:
        printf("too high\n");
        break;
    default:
        printf("way off\n");
}
```

matching a value with some associated value:
```c
int value = get_input();
const char* message = NULL;
switch (value) {
    case 1:
        message = "1";
        break;
    case 2:
        message = "2";
}
printf("message = %s\n", message);
```

## Problems

- Forgetting break
- Possible illegal states
- Hard to lint
- Lexical scoping
- Strictly integers

## Patchwork and Band-aids

### C++ attributes

C++ has introduced an attribute `[[fallthrough]]`, which the programmer can use to mark all cases of fallthrough.
The idea is then, that a linter or compiler will warn/fail, if it reaches a case of fallthrough without the attribute.
But this isn't very well implemented as of yet in my experience.

```c++
switch (x) {
    case 1:
        ; ...
        [[fallthrough]]
    case 2:
        // ...
        break;
    case 3:
        // ...
    case 4: // warning or error: unmarked fallthrough
        // ...
    // ...
}
```

### Golang no need for break

Instead of having fallthrough be implicit, and break explicit. Golang breaks unconditionally when it hits a case-label after some non-case-label code.
The idea is good, as fallthrough is almost always a mistake, but I feel that changing the mechanics of an old construct such as the switch-statement is confusing.

```go
switch (x) {
    case 1:
        ; ...
    case 2:
        // ...
    case 3:
        // ...
    case 4:
        // ...
    // ...
}
```

## Solution

Match expressions is the solution. It came from functional languages, but languages like Rust has brought it into the mainstream.

Value to action:
```rs
match color {
    Color::Red = {
        /* ... */
    }
    Color::Yellow | Color::Green = {
        if Color::Yellow {
            /* ... */
        }
        /* ... */
    }
}
```

Value to value:
```rs
let x = match y {
    Some(v) => v,
    None => 0,
};
```

Notice that the construct support all types of values, not just integers.

## Conclusion

Implement match expressions instead of switch statement in all the languages.

- https://en.wikipedia.org/wiki/Switch_statement
- https://en.cppreference.com/w/c/language/switch
- https://doc.rust-lang.org/rust-by-example/flow_control/match.html
