# Tester

An programming competition tester for the program written by C++ language.

## Usage

Use the comparator in bash.

```shell
node dp.js testing_program standard_program generator_programs
```

Some options: -exe(-e)

## Feature:

1. Generate data, run the testing program and standard program.
2. Detect the testing result - Accepted(AC), Wrong Answer(WA), Runtime Error(RE), Time Limit Exceeded(TLE).
3. Compile programs before testing.

## TODO

- Performance
    - Speed up.
    - User Interface (including option --help).

- Function
    - Support special judge(spj) when checking the answer(including whether to use "testlib.h" or not).
    - Pass parameters to data generator.
    - Detect memory limit exceeded(MLE).
    - Allow programs to use standard error stream(stderr).
    - Batch testing data.
    - Print compile log when compilation error.

- Reliability
    - Check readability, writability and executability.
    - Identify absolute path and file extension in parameters.

~~Goal: defeat chc_1234567890's duipai.exe~~
