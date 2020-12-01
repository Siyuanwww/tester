# Tester

An programming competition tester for the program written by C++ language.

## Usage

The tester can only run in bash (do not support `cmd.exe` in windows).
```shell
node [tester.js] [testing] [standard] [generator] [options]
```

Options:
```shell
-e, --exe           # Run programs without compilation
-s, --spj=...       # Check answers by special judge
```

Example:

If there is `usr.cpp`, `std.cpp` and `gen.cpp` in the current directory, then input the following command to run the tester `test.js`:
```shell
node test.js usr std gen
```

## Feature:

1. Generate data, run the testing program and standard program.
2. Detect the testing result
   - By the command `diff`: Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded.
   - By the special judge supported by `testlib.h`: in addition to the above, Wrong Output Format, Partially Correct.
3. Compile programs before testing.

## TODO

- Performance
  - Speed up.
  - User Interface.

- Function
  - Pass parameters to data generator.
  - Detect memory limit exceeded (MLE).
  - Allow programs to use standard error stream (stderr).
  - Batch testing data.
  - Print compile log when compilation error.

- Reliability
  - Check readability, writability and executability.
  - Identify absolute path and file extension in parameters.

~~Goal: defeat chc_1234567890's duipai.exe, not including speed :(~~