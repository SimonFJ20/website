
# Goto considered useful in contexts of syntactical inadequacies

**How the goto statement proves useful for code readability in suger-deficient languages.**

*S. F. Jakobsen &lt;sfja2004@gmail.com&gt;, 25. September 2024*

Say we have a program with the following functions.

```c
int sensor_init(int sda_pin, int scl_pin);
int sensor_prepare();
int sensor_read(float& value);
```

The three functions depend on each other, and are required to be called in the same order as the definitions. All three functions may fail, in which case they will return a non-zero exit code. If a function in the call chain fails, the next functions should not be called, instead the error should be handled according to which function failed with which error.

The obvious approach for most programmers might be something like the following.

```c
    int result = sensor_init(SENSOR_SDA_PIN, SENSOR_SCL_PIN);
    if (result == 0) {
        result = sensor_prepare();
        if (result == 0) {
            float value = 0;
            result = sensor_read(&value);
            if (result == 0) {
                latest_value = value;
            } else {
                printf("sensor: could not read\n");
            }
        } else {
            printf("sensor: could not prepare\n");
        }
    } else {
        printf("sensor: could not initialize\n");
    }
```

The problem with the code above should be immediately obvious. The nesting of conditional branches makes the code hard to comprehend. Which error handling code corrosponds to which call is also unclear.

The theory behind why this particular code is less comprehensible than alternative ways of expression is, that we as human programmers have a limited capacity for attention and short term information retention. The more a program deviates from a sequential flow, the more the programmer has to keep track of, the harder it is for the programmer to comprehend.

> Nesting the conditionals here masks the true meaning of what it going on. The
primary purpose of this code only applies if these conditions aren’t the case.[1]
> [Because] [i]f I’m using an if-then-else construct, I’m giving equal weight to the if leg and
the else leg.[2]

To ammend this issue, we should according to the theory refactor the code, such that it deviates less from sequential flow. In concrete, we should reconsider the branching structure of the code especially the nested parts. In order to achieve this, we will apply a refatoring replacing **Nested Conditional** with **Guard Clauses**.

The idea behind guard clauses is, that the happy path, meaning the intended optimal path through the code should be sequential. To achieve this, every time a non-optimal condition is met, eg. an error, the code should break control flow instead of branching.

In C, there is two options for implementing guard clauses using syntactically structured controlflow. *The first option* is by extracting the subject code out into it's own function and then using return statements to break controlflow in the guards. See the following example.

```c
/// @returns 0 if ok
int read_sensor_value(float* value)
{
    int result = sensor_init(SENSOR_SDA_PIN, SENSOR_SCL_PIN);
    if (result != 0) {
        printf("sensor: could not initialize\n");
        return 1;
    }
    result = sensor_prepare();
    if (result != 0) {
        printf("sensor: could not prepare\n");
        return 1;
    }
    float value = 0;
    result = sensor_read(&value);
    if (result != 0) {
        printf("sensor: could not read\n");
        return 1;
    }
    *latest_value = value;
    return 0;
}
```

This refactor is conceptually simpler than before, but extracting code into it's own function may have significant drawbacks, especially so in suger-deficient languages. Before, if `latest_value` was a value local to the original function, we have to decide how to deliver the `value` from the new function back to the caller. This question is may not be trivial and be without a definite answer, certainly with error handling in consideration.

*The second option* is using a loop construct. This could be a do-while-loop with a negative condition or a while- or for-loop with a break as the last statement. With loops, we can use the `break` statement, to break the control flow. See the following example.

```c
    while (true) {
        int result = sensor_init(SENSOR_SDA_PIN, SENSOR_SCL_PIN);
        if (result != 0) {
            printf("sensor: could not initialize\n");
            break;
        }
        result = sensor_prepare();
        if (result != 0) {
            printf("sensor: could not prepare\n");
            break;
        }
        float value = 0;
        result = sensor_read(&value);
        if (result != 0) {
            printf("sensor: could not read\n");
            break;
        }
        latest_value = value;
        break;
    }
```

This option too has its drawbacks. By using a loop, we're unintentionally communicating that we intend for iteration. It is not immediately obvious to the reader, that we use the loop for guard clauses, not iteration.

If we look at other languages than C, languages without as severe sugar-defiency, we find features which allow us to implement guard clauses without the aforementioned drawbacks. See the following snippet of the program implemented in the Rust programming language.

```rust
    'try_read_sensor_value: {
        let result = sensor.init();
        if result != 0 {
            println!("https://en.wikipedia.org/wiki/Immediately_invoked_function_expression");
            break 'try_read_sensor_value;
        }
        let result = sensor_prepare();
        if result != 0 {
            printf("sensor: could not prepare\n");
            break 'try_read_sensor_value;
        }
        let mut value;
        let result = sensor_read(&mut value);
        if (result != 0) {
            printf("sensor: could not read\n");
            break 'try_read_sensor_value;
        }
        latest_value = value;
    }
```

In Rust, we can assign labels to blocks, eg. `'try_read_sensor_value` is a label assigned to the block. We can then use a `break` statement targetting the specific block using the label.[3] In the languages Javascript and C++, it's possible to achieve the same using IIFEs with slightly less functionality.[4][5]

We can emulate the same construct in C as in the example using Rust. We can emulate it by using the goto statement. Consider the following example.

```c
    {
        int result = sensor_init(SENSOR_SDA_PIN, SENSOR_SCL_PIN);
        if (result != 0) {
            printf("sensor: could not initialize\n");
            goto try_read_sensor_value;
        }
        result = sensor_prepare();
        if (result != 0) {
            printf("sensor: could not prepare\n");
            goto try_read_sensor_value;
        }
        float value = 0;
        result = sensor_read(&value);
        if (result != 0) {
            printf("sensor: could not read\n");
            goto try_read_sensor_value;
        }
        latest_value = value;
    }
try_read_sensor_value:
```

The benefits should be clear. The drawbacks are only the following. 1) This methodology requires of the programmer a certain amount of discipline, as to implement the contruct correctly. 2) Expanding from the previous, the use of the goto statement might instill a certain mindset in future programmers, that this one allow use of goto implies any use of goto is allowed.

*But is the Go To Statement not Considered Harmful?* i hear you ask.



## Notes

1. Martin Fowler: *Refactoring: Improving the Design of Existing Code*, Pearson Addison-Weasley, Second edition, 2019, pp. 268
2. Ibid. pp. 267
3. Rust By Example: *Nesting and labels*, https://doc.rust-lang.org/rust-by-example/flow_control/loop/nested.html, visited 25-09-2024
4. MDN Web Docs: *IIFE*, https://developer.mozilla.org/en-US/docs/Glossary/IIFE, visited 25-09-2024
5. Erik Rigtorp: *Uses of immediately invoked function expressions (IIFE) in C++*, https://rigtorp.se/iife/, visited 25-09-2024

