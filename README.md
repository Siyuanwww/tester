# Tester

An programming competition tester for the program written by C++ language.

## Usage

The tester can only run in bash(do not support cmd in windows).
```shell
node dp.js ${testing_program} ${standard_program} ${generator_program}
```

Some options:
```shell
-exe / -e       # Run without compilation
-spj= / -s=     # Check answers by special judge
```

## Feature:

1. Generate data, run the testing program and standard program.
2. Detect the testing result
   - By the command `diff`: Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded.
   - By the special judge supported by "testlib.h": in addition to the above, Wrong Output Format, Partially Correct.
3. Compile programs before testing.

## TODO

- Performance
    - Speed up.
    - User Interface (including option --help).

- Function
    - Pass parameters to data generator.
    - Detect memory limit exceeded(MLE).
    - Allow programs to use standard error stream(stderr).
    - Batch testing data.
    - Print compile log when compilation error.

- Reliability
    - Check readability, writability and executability.
    - Identify absolute path and file extension in parameters.

~~Goal: defeat chc_1234567890's duipai.exe~~
