// Course content. Prose uses [[double brackets]] for inline code.
window.COURSE = {
  lessons: [
    {
      id: "hello",
      level: "beginner",
      title: "Hello, World",
      minutes: 5,
      goal: "Write, compile, and run your first C program.",
      blocks: [
        { p: "A C program is a collection of functions, and execution always starts at [[main]]. To print text you call [[printf]], which is declared in the standard input/output header, [[stdio.h]]." },
        {
          code: `#include <stdio.h>

int main(void) {
    printf("Hello, world!\\n");
    return 0;
}`,
          file: "hello.c",
        },
        { out: "Hello, world!" },
        { p: "The [[#include]] line pastes in the declaration of [[printf]]. Inside a string, [[\\n]] means “new line”. [[return 0;]] tells the operating system the program finished successfully. Save the file and build it with a C compiler:" },
        { shell: "gcc hello.c -o hello\n./hello" },
        { note: "C is case-sensitive. [[printf]] and [[Main]] are different names. Most statements end with a semicolon, and every program needs exactly one [[main]]." },
      ],
      quiz: {
        q: "Which line makes [[printf]] available to the program?",
        options: ["[[#include <stdio.h>]]", "[[#include <stdlib.h>]]", "[[using namespace std;]]", "Nothing — [[printf]] is a keyword"],
        answer: 0,
        why: "[[stdio.h]] declares the standard input/output functions, including [[printf]] and [[scanf]].",
      },
      challenge: {
        prompt: "Print [[C rocks!]] followed by a newline. Fill in the blank.",
        template: `#include <stdio.h>

int main(void) {
    printf("___\\n");
    return 0;
}`,
        answers: [["C rocks!"]],
        hint: "Type the text inside the quotes. The [[\\n]] stays right after the blank.",
        why: "Text between double quotes is printed literally. The [[\\n]] then moves the cursor to the next line.",
      },
    },
    {
      id: "types",
      level: "beginner",
      title: "Variables and Types",
      minutes: 6,
      goal: "Store numbers and characters in variables and print them.",
      blocks: [
        { p: "Every variable has a type, which tells the compiler how much memory it needs and how to interpret it. The everyday types are:" },
        {
          list: [
            "[[int]] — whole numbers such as [[-3]], [[0]], [[42]] (usually 4 bytes)",
            "[[float]] — decimals with about 7 significant digits (4 bytes)",
            "[[double]] — decimals with about 15 significant digits (8 bytes); use this by default",
            "[[char]] — a single character such as [['A']] (1 byte)",
          ],
        },
        {
          code: `#include <stdio.h>

int main(void) {
    int age = 20;
    double price = 9.99;
    char grade = 'A';

    printf("age: %d\\n", age);
    printf("price: %.2f\\n", price);
    printf("grade: %c\\n", grade);
    return 0;
}`,
          file: "types.c",
        },
        { out: "age: 20\nprice: 9.99\ngrade: A" },
        { p: "Each type needs a matching format specifier: [[%d]] for [[int]], [[%f]] for [[double]], [[%c]] for [[char]]. The [[.2]] in [[%.2f]] rounds the output to two decimal places. A mismatched specifier is undefined behavior: it can print garbage or crash." },
        { note: "Local variables are not initialized for you. Write [[int count = 0;]], not just [[int count;]], or read whatever garbage was in memory." },
      ],
      quiz: {
        q: "Which specifier prints a [[double]]?",
        options: ["[[%d]]", "[[%f]]", "[[%c]]", "[[%s]]"],
        answer: 1,
        why: "[[%f]] prints [[float]] and [[double]] with [[printf]]. Use [[%lf]] only with [[scanf]].",
      },
      challenge: {
        prompt: "Declare [[price]] as a [[double]] holding [[4.5]], then print it with one decimal place.",
        template: `#include <stdio.h>

int main(void) {
    ___ price = 4.5;
    printf("___\\n", price);
    return 0;
}`,
        answers: [["double"], ["%.1f"]],
        hint: "The first blank is a type name. The second is a format specifier placed inside the quotes.",
        why: "[[double]] stores the decimal, and [[%.1f]] prints exactly one digit after the point, so the output is [[4.5]].",
      },
    },
    {
      id: "operators",
      level: "beginner",
      title: "Operators and Expressions",
      minutes: 6,
      goal: "Do arithmetic without being surprised by integer division.",
      blocks: [
        { p: "C supports the usual arithmetic operators: [[+]], [[-]], [[*]], [[/]], and the remainder operator [[%]] (integers only). Precedence follows normal math: multiplication and division first, then addition and subtraction. Parentheses always win." },
        {
          code: `int a = 7, b = 2;
double half = a / 2.0;

printf("%d\\n", a + b);     // 9
printf("%d\\n", a / b);     // 3, not 3.5
printf("%d\\n", a % b);     // 1
printf("%.1f\\n", half);    // 3.5`,
          file: "arithmetic.c",
        },
        { p: "When both operands are integers, division throws away the fraction. Mix in a decimal and the result becomes floating point. The [[%]] operator gives the remainder, which is handy for testing even and odd numbers." },
        { p: "Shorthand exists for common updates: [[x += 3]] means [[x = x + 3]], and [[x++]] adds one. The [[++]] and [[--]] operators change the variable and return a value, which is why mixing them into bigger expressions gets confusing fast." },
        { note: "[[=]] assigns. [[==]] compares. Mixing them up compiles fine and is a classic bug — more on that in Conditionals." },
      ],
      quiz: {
        q: "What does [[17 % 5]] evaluate to?",
        options: ["2", "3", "3.4", "12"],
        answer: 0,
        why: "17 divided by 5 is 3 with a remainder of 2. [[%]] returns that remainder.",
      },
      challenge: {
        prompt: "Fill in the operator so [[value]] becomes [[1]] when [[x]] is [[10]] and [[y]] is [[3]].",
        template: `int x = 10, y = 3;
int value = x ___ y;   // should be 1`,
        answers: [["%"]],
        hint: "You want the leftover after dividing 10 by 3.",
        why: "[[10 % 3]] is the remainder of 10 divided by 3, which is 1.",
      },
    },
    {
      id: "input",
      level: "beginner",
      title: "Reading Input",
      minutes: 6,
      goal: "Read numbers typed by the user with scanf.",
      blocks: [
        { p: "[[scanf]] reads formatted input from the keyboard. Give it a format string and the address of each variable. The [[&]] takes an address." },
        {
          code: `#include <stdio.h>

int main(void) {
    int age;
    printf("Your age: ");
    scanf("%d", &age);
    printf("Next year you will be %d.\\n", age + 1);
    return 0;
}`,
          file: "age.c",
        },
        { p: "The [[&age]] is the address of [[age]] in memory. [[scanf]] needs that address so it can write the value into your variable. Leave the [[&]] out and the program may crash." },
        { note: "For a [[double]], [[scanf]] wants [[%lf]] — the [[l]] is required here, unlike with [[printf]]. Check the return value when input can be bad: [[if (scanf(\"%d\", &age) != 1) { ... }]]." },
        { p: "[[scanf]] stops at whitespace for [[%d]] and [[%s]]. To read a whole line including spaces, use [[fgets]] instead." },
      ],
      quiz: {
        q: "Why does [[scanf(\"%d\", &age)]] need the [[&]]?",
        options: ["It passes the address so [[scanf]] can store the value", "It converts the number to text", "It clears the variable first", "It is optional and only for style"],
        answer: 0,
        why: "[[scanf]] writes through the pointer it receives. Without an address it has nowhere valid to put the number.",
      },
      challenge: {
        prompt: "Read one integer into [[n]], then print it.",
        template: `int n;
scanf("___", ___n);
printf("%d\\n", n);`,
        answers: [["%d"], ["&"]],
        hint: "The format specifier goes in the quotes. The second blank is the address-of operator.",
        why: "[[scanf(\"%d\", &n)]] reads an integer and stores it at the address of [[n]].",
      },
    },
    {
      id: "conditionals",
      level: "beginner",
      title: "Making Decisions",
      minutes: 7,
      goal: "Branch with if, else if, else, and switch.",
      blocks: [
        { p: "Conditions are expressions. Zero is false; every other value is true. Use [[if]], [[else if]], and [[else]] to pick a path:" },
        {
          code: `int score = 82;

if (score >= 90) {
    printf("A\\n");
} else if (score >= 80) {
    printf("B\\n");
} else {
    printf("C\\n");
}`,
          file: "grade.c",
        },
        { out: "B" },
        { p: "Combine conditions with [[&&]] (and), [[||]] (or), and [[!]] (not). [[switch]] is a tidy alternative when one value has several exact cases:" },
        {
          code: `switch (choice) {
    case 1:
        printf("one\\n");
        break;
    case 2:
        printf("two\\n");
        break;
    default:
        printf("other\\n");
}`,
          file: "menu.c",
        },
        { note: "Forgetting [[break]] makes execution fall through into the next case. That is occasionally useful, but usually a bug." },
        { p: "Watch the difference between assignment and comparison:" },
        {
          code: `int x = 0;
if (x = 5) {
    printf("yes\\n");   // prints: yes
}`,
          file: "trap.c",
        },
        { p: "[[x = 5]] assigns 5 and evaluates to 5, which is true. The compiler may warn, but the code is valid. Write [[x == 5]] to compare." },
      ],
      quiz: {
        q: "What does this print?\n\n[[int x = 0; if (x = 5) printf(\"yes\");]]",
        options: ["[[yes]]", "Nothing", "A compile error", "[[5]]"],
        answer: 0,
        why: "[[x = 5]] is an assignment whose value is 5. Since 5 is nonzero, the condition is true and [[yes]] prints. Use [[==]] to compare.",
      },
      challenge: {
        prompt: "Fill the blank so the message prints only when [[n]] is even.",
        template: `if (n ___ 2 == 0) {
    printf("even\\n");
}`,
        answers: [["%"]],
        hint: "Even numbers leave no remainder when divided by 2.",
        why: "[[n % 2]] is 0 for even numbers and 1 for odd numbers.",
      },
    },
    {
      id: "loops",
      level: "beginner",
      title: "Loops",
      minutes: 7,
      goal: "Repeat work with for, while, and do-while.",
      blocks: [
        { p: "Use [[for]] when you know how many times to repeat. It packs the starting value, the condition, and the update into one line:" },
        {
          code: `for (int i = 1; i <= 3; i++) {
    printf("%d ", i);
}
// 1 2 3`,
          file: "count.c",
        },
        { p: "Use [[while]] when you repeat until something changes. The condition is checked before each pass:" },
        {
          code: `int i = 5;
while (i > 0) {
    printf("%d", i);
    i--;
}`,
          file: "countdown.c",
        },
        { out: "54321" },
        { p: "[[do-while]] checks the condition after the body, so the body always runs at least once. [[break]] leaves the loop immediately; [[continue]] skips the rest of the current pass." },
        { note: "If nothing inside a [[while]] loop moves the condition toward false, the loop runs forever. Make sure [[i--]] or an equivalent update is there." },
      ],
      quiz: {
        q: "How many times does the body run?\n\n[[for (int i = 0; i < 5; i++) { ... }]]",
        options: ["4", "5", "6", "It depends on the body"],
        answer: 1,
        why: "[[i]] takes the values 0, 1, 2, 3, and 4 — five passes. The loop stops as soon as [[i < 5]] is false.",
      },
      challenge: {
        prompt: "Complete the loop so [[sum]] ends up as 55 (the numbers 1 through 10).",
        template: `int sum = 0;
for (int i = 1; i ___ 10; i++) {
    sum += i;
}
printf("%d\\n", sum);   // 55`,
        answers: [["<="]],
        hint: "The loop must include 10 as well as 1.",
        why: "With [[i <= 10]], the body runs for every value from 1 to 10, giving 55.",
      },
    },
    {
      id: "functions",
      level: "beginner",
      title: "Functions",
      minutes: 7,
      goal: "Break a program into small, reusable pieces.",
      blocks: [
        { p: "A function has a return type, a name, parameters, and a body. Declare it before use so the compiler knows its shape:" },
        {
          code: `#include <stdio.h>

int square(int n);              // declaration

int main(void) {
    printf("%d\\n", square(6)); // 36
    return 0;
}

int square(int n) {             // definition
    return n * n;
}`,
          file: "square.c",
        },
        { p: "C passes arguments by value: the function receives a copy. Changing the parameter inside the function does not touch the caller's variable. If you need that, pass a pointer (see Pointers)." },
        { p: "Use [[void]] when there is nothing to pass or return: [[int main(void)]] takes no arguments, and a logging function might be [[void log_message(const char *text)]]. A function that returns a value must [[return]] one on every path." },
        { note: "Keep functions small and focused. A prototype plus a definition is normal in C; the prototype lives in a header when other files need it." },
      ],
      quiz: {
        q: "What does “pass by value” mean?",
        options: ["The function gets a copy of the argument", "The function gets the caller's variable itself", "Only numbers can be passed", "The argument is printed automatically"],
        answer: 0,
        why: "The parameter is a fresh variable initialized with the argument's value. Reassigning it inside the function leaves the caller unchanged.",
      },
      challenge: {
        prompt: "Complete the function so it returns the larger value.",
        template: `int max(int a, int b) {
    if (a > b) return ___;
    return b;
}`,
        answers: [["a"]],
        hint: "When [[a > b]] is true, which one is the larger value?",
        why: "If [[a]] is greater, it is the maximum; otherwise the second [[return]] hands back [[b]].",
      },
    },
    {
      id: "arrays",
      level: "beginner",
      title: "Arrays and Strings",
      minutes: 8,
      goal: "Store lists of values and work with text safely.",
      blocks: [
        { p: "An array stores several values of the same type in one block. Indexes start at 0, so an array of five elements uses indexes 0 through 4." },
        {
          code: `int scores[5] = {90, 85, 77, 95, 88};

printf("%d\\n", scores[0]);   // 90
printf("%d\\n", scores[4]);   // 88

for (int i = 0; i < 5; i++) {
    printf("%d ", scores[i]);
}`,
          file: "scores.c",
        },
        { p: "C does not check array bounds. [[scores[5]]] is outside the array and writes over adjacent memory. That corruption may crash later or silently produce wrong answers." },
        { p: "A string is a [[char]] array ending with a hidden null character, [['\\0']]. String functions count characters until they reach it:" },
        {
          code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char name[] = "Ada";

    printf("%s has %zu letters\\n", name, strlen(name));
    return 0;
}`,
          file: "name.c",
        },
        { out: "Ada has 3 letters" },
        { note: "[[char name[] = \"Ada\"]] needs four bytes: A, d, a, and the terminator. [[strlen]] reports 3 because it does not count the terminator." },
      ],
      quiz: {
        q: "What is the last valid index of [[int a[5]]]?",
        options: ["5", "4", "6", "0"],
        answer: 1,
        why: "Indexes run from 0 up to size minus one: 0, 1, 2, 3, 4.",
      },
      challenge: {
        prompt: "Print the last element of the array.",
        template: `int nums[3] = {10, 20, 30};
printf("%d\\n", nums[___]);   // 30`,
        answers: [["2"]],
        hint: "Three elements use indexes 0, 1, and 2.",
        why: "[[nums[2]]] is the third element, 30. [[nums[3]]] would be out of bounds.",
      },
    },
    {
      id: "pointers",
      level: "intermediate",
      title: "Pointers",
      minutes: 9,
      goal: "Understand addresses, dereferencing, and why scanf needs &.",
      blocks: [
        { p: "Every variable lives at an address. A pointer is a variable that stores an address. [[&]] gets the address of something, and [[*]] follows a pointer to the value it points at." },
        {
          code: `int x = 42;
int *p = &x;          // p points to x

printf("%d\\n", *p);   // 42
*p = 7;               // write through the pointer
printf("%d\\n", x);    // 7`,
          file: "pointers.c",
        },
        { p: "The type matters. [[int *p]] tells the compiler that the memory at that address holds an [[int]], so [[*p]] reads the right number of bytes." },
        { p: "Pointers let a function change the caller's variables — this is how [[swap]] works, and why [[scanf]] takes addresses:" },
        {
          code: `void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

// call it with addresses:
swap(&x, &y);`,
          file: "swap.c",
        },
        { note: "A pointer that points nowhere useful is dangerous. Set unused pointers to [[NULL]] and check before dereferencing: [[if (p != NULL) { ... }]]." },
      ],
      quiz: {
        q: "If [[int *p = &x;]] what does [[*p]] do?",
        options: ["Reads the value stored at the address in [[p]]", "Reads the address of [[p]]", "Multiplies [[p]] by something", "Nothing until you assign"],
        answer: 0,
        why: "The [[*]] operator dereferences: it goes to the stored address and gives you the value there.",
      },
      challenge: {
        prompt: "Make [[p]] point at [[x]] so the program prints 5.",
        template: `int x = 5;
int *p = ___x;
printf("%d\\n", *p);   // 5`,
        answers: [["&"]],
        hint: "You need the address of [[x]], not its value.",
        why: "[[&x]] is the address of [[x]]. Dereferencing [[p]] then reads 5.",
      },
    },
    {
      id: "structs",
      level: "intermediate",
      title: "Structs and Enums",
      minutes: 8,
      goal: "Group related data and name sets of constants.",
      blocks: [
        { p: "A [[struct]] collects fields of different types into one value. [[typedef]] gives the struct a short name so you can write [[Point]] instead of [[struct Point]]:" },
        {
          code: `#include <stdio.h>

typedef struct {
    int x;
    int y;
} Point;

int main(void) {
    Point p = {3, 4};
    Point *ptr = &p;

    printf("%d,%d\\n", p.x, p.y);   // 3,4
    printf("%d\\n", ptr->x);        // 3
    return 0;
}`,
          file: "point.c",
        },
        { p: "Use a dot to reach a field: [[p.x]]. With a pointer, [[ptr->x]] is shorthand for [[(*ptr).x]]. Structs are copied when assigned or passed by value, so pass a pointer for large structs." },
        { p: "An [[enum]] names a set of integer constants. The first is 0 unless you say otherwise:" },
        {
          code: `typedef enum { RED, GREEN, BLUE } Color;

Color c = GREEN;      // GREEN is 1
if (c == GREEN) {
    printf("go\\n");
}`,
          file: "color.c",
        },
        { note: "Enums make code readable and let the compiler warn about some mistakes. They are integers underneath, so they work in [[switch]] statements." },
      ],
      quiz: {
        q: "How do you read field [[x]] through a pointer [[ptr]]?",
        options: ["[[ptr.x]]", "[[ptr->x]]", "[[*ptr.x]]", "[[&ptr.x]]"],
        answer: 1,
        why: "[[ptr->x]] is the pointer form. [[ptr.x]] would only work if [[ptr]] were a struct value, not a pointer.",
      },
      challenge: {
        prompt: "Print the height of the rectangle.",
        template: `typedef struct { int width; int height; } Rect;

Rect r = {4, 9};
printf("%d\\n", r.___);   // 9`,
        answers: [["height"]],
        hint: "The field names are [[width]] and [[height]].",
        why: "[[r.height]] reads the second field, 9.",
      },
    },
    {
      id: "memory",
      level: "intermediate",
      title: "Dynamic Memory",
      minutes: 10,
      goal: "Allocate memory at runtime and free it exactly once.",
      blocks: [
        { p: "Local variables live on the stack and disappear when their function returns. When you need memory whose size is only known at runtime, or that must outlive the function, allocate it on the heap with [[malloc]]." },
        {
          code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *a = malloc(n * sizeof(int));
    if (a == NULL) {
        return 1;              // allocation failed
    }

    for (int i = 0; i < n; i++) {
        a[i] = i * i;
    }

    printf("%d\\n", a[4]);     // 16
    free(a);
    a = NULL;                  // avoid a dangling pointer
    return 0;
}`,
          file: "dynamic.c",
        },
        { p: "[[malloc]] returns a pointer to a block of bytes, or [[NULL]] if it cannot allocate. In C a [[void *]] converts to any pointer type automatically, but always check for [[NULL]]. [[calloc]] allocates and zeroes the memory; [[realloc]] resizes an existing block." },
        { p: "[[sizeof(int)]] is the number of bytes one [[int]] needs, so [[n * sizeof(int)]] is the size of an array of [[n]] integers. Using [[sizeof]] keeps the code correct when types change." },
        { note: "Every successful allocation needs exactly one [[free]]. Forgetting it leaks memory; freeing twice or using memory after freeing is undefined behavior." },
      ],
      quiz: {
        q: "Which pair correctly allocates and releases heap memory?",
        options: ["[[malloc]] and [[free]]", "[[alloc]] and [[delete]]", "[[new]] and [[free]]", "[[malloc]] and [[close]]"],
        answer: 0,
        why: "C uses [[malloc]], [[calloc]], or [[realloc]] to allocate and [[free]] to release. [[new]] and [[delete]] belong to C++.",
      },
      challenge: {
        prompt: "Allocate space for 5 integers. Use [[sizeof]] so the size follows the type.",
        template: `int *a = malloc(5 * ___);
if (a == NULL) return 1;
free(a);`,
        answers: [["sizeof(int)"]],
        hint: "The expression is the size of one [[int]] in bytes.",
        why: "[[5 * sizeof(int)]] requests exactly enough bytes for five integers.",
      },
    },
    {
      id: "files",
      level: "intermediate",
      title: "File Input and Output",
      minutes: 9,
      goal: "Write to and read from files with FILE pointers.",
      blocks: [
        { p: "A [[FILE *]] represents an open file. Open it with [[fopen]], use it, and close it with [[fclose]] when you are done." },
        {
          code: `#include <stdio.h>

int main(void) {
    FILE *f = fopen("notes.txt", "w");
    if (f == NULL) {
        perror("notes.txt");
        return 1;
    }

    fprintf(f, "line one\\nline two\\n");
    fclose(f);

    char buf[100];
    f = fopen("notes.txt", "r");
    while (fgets(buf, sizeof buf, f) != NULL) {
        printf("%s", buf);
    }
    fclose(f);
    return 0;
}`,
          file: "notes.c",
        },
        { p: "The mode decides what happens: [[\"r\"]] reads an existing file, [[\"w\"]] creates or truncates a file, and [[\"a\"]] appends to the end. [[fgets]] reads one line at a time and keeps the newline; it returns [[NULL]] at end of file or on error." },
        { note: "Always check that [[fopen]] returned non-NULL, and close every file you open. [[perror]] prints a useful system message when opening fails." },
        { p: "[[fprintf]] works like [[printf]] but writes to a file. [[fscanf]] and [[fgets]] read back. For binary data, open with [[\"rb\"]] or [[\"wb\"]] and use [[fread]]/[[fwrite]]." },
      ],
      quiz: {
        q: "Which mode opens a file for appending?",
        options: ["[[\"r\"]]", "[[\"w\"]]", "[[\"a\"]]", "[[\"x\"]]"],
        answer: 2,
        why: "[[\"a\"]] writes at the end without erasing existing content. [[\"w\"]] truncates the file first.",
      },
      challenge: {
        prompt: "Open [[data.txt]] for writing, creating or overwriting it.",
        template: `FILE *f = fopen("data.txt", "___");
if (f == NULL) return 1;`,
        answers: [["w"]],
        hint: "Only one mode truncates an existing file.",
        why: "[[\"w\"]] creates the file if needed and empties it if it already exists.",
      },
    },
    {
      id: "preprocessor",
      level: "intermediate",
      title: "The Preprocessor",
      minutes: 8,
      goal: "Use #include, #define, and include guards correctly.",
      blocks: [
        { p: "Before compiling, the preprocessor edits your source as text. It handles [[#include]] by pasting in a file, [[#define]] by substituting text, and [[#ifndef]] by including code conditionally." },
        {
          code: `#define MAX 100
#define SQUARE(x) ((x) * (x))

#ifndef POINT_H
#define POINT_H

typedef struct { int x, y; } Point;

#endif`,
          file: "point.h",
        },
        { p: "The [[#ifndef]] / [[#define]] / [[#endif]] pattern is an include guard. It stops a header from being pasted twice, which would otherwise duplicate declarations." },
        { p: "Macros are text substitution, not functions. The extra parentheses in [[SQUARE(x)]] are essential: without them, [[SQUARE(1 + 2)]] would expand to [[1 + 2 * 1 + 2]] instead of 9. Macros also evaluate their arguments every time they appear, so [[SQUARE(i++)]] increments twice." },
        { note: "For constants, prefer [[const int max = 100;]] or [[enum]]s — they have types and scope. Keep macros for things the language cannot express, like conditional compilation." },
      ],
      quiz: {
        q: "What does [[#define MAX 100]] actually do?",
        options: ["Creates a typed constant named [[MAX]]", "Replaces the token [[MAX]] with [[100]] before compilation", "Runs a function at startup", "Reserves 100 bytes of memory"],
        answer: 1,
        why: "[[#define]] is a preprocessing text substitution. The compiler sees [[100]] wherever [[MAX]] appeared.",
      },
      challenge: {
        prompt: "Complete the macro so [[SQUARE(3)]] expands to 9.",
        template: `#define SQUARE(x) ((x) ___ (x))`,
        answers: [["*"]],
        hint: "A square multiplies a number by itself.",
        why: "[[((x) * (x))]] expands safely for any expression, including [[SQUARE(1 + 2)]].",
      },
    },
    {
      id: "debugging",
      level: "intermediate",
      title: "Debugging and Common Bugs",
      minutes: 9,
      goal: "Catch the mistakes C lets you make before they bite.",
      blocks: [
        { p: "C trusts you, which means many bugs compile without complaint. Turn on warnings and treat them as errors to fix:" },
        { shell: "gcc -Wall -Wextra -g program.c -o program" },
        { p: "The off-by-one loop is the most common array bug:" },
        {
          code: `int a[5] = {1, 2, 3, 4, 5};

for (int i = 0; i <= 5; i++) {   // bug: reads a[5]
    printf("%d\\n", a[i]);
}`,
          file: "offbyone.c",
        },
        { p: "Valid indexes are 0 through 4, so the condition must be [[i < 5]]. The last pass reads past the array, which is undefined behavior." },
        {
          list: [
            "Uninitialized variables hold garbage — always give them a value.",
            "[[=]] in a condition is an assignment; use [[==]] to compare.",
            "[[scanf(\"%s\", buf)]] and [[strcpy]] can overflow a fixed buffer; prefer [[fgets]] with the buffer size.",
            "Missing [[&]] in [[scanf]], or a mismatched format specifier, causes unpredictable output.",
            "Using memory after [[free]], or forgetting [[free]], corrupts or leaks.",
          ],
        },
        { p: "For runtime bugs, compile with sanitizers. They catch out-of-bounds access, use-after-free, and leaks with a clear report:" },
        { shell: "gcc -g -fsanitize=address,undefined program.c -o program" },
        { note: "Read the first error or warning, not the last. Fix one thing, rebuild, and run again — later errors are often consequences of the first." },
      ],
      quiz: {
        q: "Which flag enables the most useful compiler warnings?",
        options: ["[[-O2]]", "[[-Wall]]", "[[-g]]", "[[-lm]]"],
        answer: 1,
        why: "[[-Wall]] turns on common warnings, and [[-Wextra]] adds more. [[-O2]] optimizes and [[-g]] adds debug symbols.",
      },
      challenge: {
        prompt: "Fix the loop so it visits every element exactly once.",
        template: `int a[5] = {1, 2, 3, 4, 5};
for (int i = 0; i ___ 5; i++) {
    printf("%d\\n", a[i]);
}`,
        answers: [["<"]],
        hint: "The last valid index is 4, so stop before [[i]] reaches 5.",
        why: "With [[i < 5]] the body runs for 0 through 4 and never touches [[a[5]]].",
      },
    },
  ],

  finalQuiz: [
    {
      q: "Which header declares [[malloc]] and [[free]]?",
      options: ["[[<stdio.h>]]", "[[<stdlib.h>]]", "[[<string.h>]]", "[[<memory.h>]]"],
      answer: 1,
      why: "Heap allocation functions live in [[stdlib.h]].",
    },
    {
      q: "What does [[printf(\"%d\", 9 / 4)]] print?",
      options: ["2", "2.25", "2.5", "3"],
      answer: 0,
      why: "Both operands are integers, so the division truncates to 2.",
    },
    {
      q: "After [[int x = 3; int *p = &x; *p = 10;]] what is [[x]]?",
      options: ["3", "10", "The address of [[p]]", "Undefined"],
      answer: 1,
      why: "[[*p = 10]] writes 10 into the memory that [[p]] points at — the variable [[x]].",
    },
    {
      q: "What is [[strlen(\"hello\")]]?",
      options: ["4", "5", "6", "Depends on the compiler"],
      answer: 1,
      why: "Five characters. The terminating null character is not counted.",
    },
    {
      q: "How do you access member [[y]] of a struct through pointer [[p]]?",
      options: ["[[p.y]]", "[[p->y]]", "[[p*y]]", "[[&p.y]]"],
      answer: 1,
      why: "The arrow operator dereferences the pointer and selects the member.",
    },
    {
      q: "What happens if you never call [[free]] on a successful [[malloc]]?",
      options: ["The compiler refuses to build", "The memory is leaked until the program exits", "The variable is freed automatically when it goes out of scope", "The program crashes immediately"],
      answer: 1,
      why: "Heap memory is not reclaimed automatically. Long-running programs can run out of memory.",
    },
    {
      q: "Which [[fopen]] mode creates the file if needed and empties it if it exists?",
      options: ["[[\"r\"]]", "[[\"a\"]]", "[[\"w\"]]", "[[\"r+\"]]"],
      answer: 2,
      why: "[[\"w\"]] truncates or creates. [[\"a\"]] appends, and [[\"r\"]] requires an existing file.",
    },
    {
      q: "Why does an include guard use [[#ifndef]]?",
      options: ["To skip the header if it was already included", "To optimize the generated code", "To hide functions from other files", "To check whether a file exists on disk"],
      answer: 0,
      why: "The guard macro is defined on the first inclusion, so later inclusions skip the body.",
    },
    {
      q: "What is the last valid index of [[int a[4]]]?",
      options: ["4", "3", "5", "0"],
      answer: 1,
      why: "Four elements use indexes 0, 1, 2, and 3.",
    },
    {
      q: "Which is the safest way to read a line of text into a fixed buffer?",
      options: ["[[gets(buf)]]", "[[scanf(\"%s\", buf)]]", "[[fgets(buf, sizeof buf, stdin)]]", "[[strcpy(buf, input)]]"],
      answer: 2,
      why: "[[fgets]] takes the buffer size and cannot write past it. [[gets]] is removed from modern C.",
    },
  ],
};
