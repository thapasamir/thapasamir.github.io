---
Title: My first blog 
author: samir thapa
date: 2022-08-13 18:32:00 -0500
categories: [programming,python]
tags: [programming,python,contex manager]
---
  
# What is a context manager in Python and how to create your own context manager?

![](https://miro.medium.com/max/700/0*G-2tNvMiBXnuycCS.jpg)

If you don,t know what is context manager the don't worry you will know it clearly after you finish this article

![](https://miro.medium.com/max/480/1*SkOLGqLCykmP6iLo2BUWdQ.gif)

The main principle behind writing a context manager is that you’re writing code that’s meant to surround a block of statements as defined by the use of the with a statement. Context managers allow you to allocate and release resources precisely when you want to. The most widely used example of context managers is the  `with`  statement. Suppose you have two related operations which you’d like to execute as a pair, with a block of code in between. Context managers allow you to do specifically that. For example:

 ```python
    with open('cornsite.txt', 'wt') as fk:  
        fk.write('cornhub.com')
```
The above code opens the file called “cornsite.txt” and writes some data and closes it. If an error occurs while writing the data to the file, it tries to close it. It will look something like this if we don,t use context manager:

  ```python
    file = open('cornsite.txt', 'wt')  
    try:  
        file.write('cornhub.com!')  
    finally:  
        file.close()
```

The main advantage of using a  `with`  statement is that it makes sure our file is closed without paying attention to how the nested block exits.

Now let's see how can we create our own context manager

![](https://miro.medium.com/max/220/1*6r0V7ESA_PbRojWjSWhZSg.gif)

## Accomplishing context manager as through class :

To create a  _context_  manager with the help of class we have to use  `__enter__`  and  `__exit__`  dunder method. The __enter__() returns the resource that needs to be managed and the __exit__() does not return anything but performs the cleanup operations. let,s make our own file opening context manager :
```python
class Banana(object):  
    def __init__(self, file_name, method):  
        self.file_object = open(file_name, method)  
    def __enter__(self):  
        return self.file_object  
    def __exit__(self, type, value, traceback):  
        self.file_object.close()
```
Just by defining  `__enter__`  and  `__exit__`  methods we can use our new class Banana in a  `with`  statement

```python
with Banana('message.txt', 'w') as fk:  
    fk.write('Send Dudes!😇')
```
Congratulation you just created your first context manager

![](https://miro.medium.com/max/220/1*2QmkbB8Rg5c8xkdg6cbmyw.gif)

Let's see what is happening underneath the hood:

1.  The  `with`  statement stores the  `__exit__`  method of the  `Banana`  class.
2.  It calls the  `__enter__`  method of the  `Banana`  class.
3.  The  `__enter__`  method opens the file and returns it.
4.  The opened file handle is passed to  `fk`.
5.  We write to the file using  `.write()`.
6.  The  `with`  statement calls the stored  `__exit__`  method.
7.  The  `__exit__`  method closes the file.

## Now Accomplishing context manager as through Generator

Creating context managers the traditional way, by writing a class with  `__enter__`  and  `__exit__`  methods are not difficult. But sometimes it is more overhead than you need just to manage a trivial bit of context. For that Python has a contextlib module for this very purpose. Instead of a class, we can implement a Context Manager using a generator function. Let’s see a basic, useless(as you) example:
```python
from contextlib import contextmanager  
@contextmanager 
def banana(name):  
    f = open(name, 'w')  
    try:  
        yield f  
    finally:  
        f.close()
```

Now let's use this

```python
with banana('potato.txt') as f:  
    f.write('sexy kto mah 123!')
```
![](https://miro.medium.com/max/220/1*rGk2cTpH4klGFGa6hWcl6A.gif)

Booom its working lets discuss a little how it's working

1.  Python encounters the  `yield`  keyword. Due to this, it creates a generator instead of a normal function.
2.  Due to the decoration, contextmanager is called with the function name (`banana`) as its argument.
3.  The  `contextmanager`  decorator returns the generator wrapped by the  `GeneratorContextManager`  object.
4.  The  `GeneratorContextManager`  is assigned to the  `banana`  function. Therefore, when we later call the  `banana`  function, we are actually calling the  `GeneratorContextManager`  object.

# I know this blog is not so good and big but I know

## And thanks for reading my blog and please give your feedback in the comment section.Bye see ya in new Blog :)
