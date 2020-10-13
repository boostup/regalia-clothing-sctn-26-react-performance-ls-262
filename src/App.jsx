import React, { useCallback, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

/**
 *
 * One reason we can encounter situations where unwanted re-renders occur, can be that we are defining an inline function.
 *
 * So, to make sure we are not creating the inline function at each re-render, we can use the hook `useCallback`.
 *
 * In order to test whether we re-create a function or not, we can test whether it's reference in memory is different from the previous render.
 *
 * One way to do this is to add the function to a Set collection, which accepts only unique objects (unique reference in memory that is), or in this case, functions (in JS, functions are also objects).
 *
 * So below, the Set called `functions` will be the collection accepting new function objects.
 *
 * By logging it's content to the console, we can see whether the function objects we are trying to add to the Set are added or not.
 *
 * In other words, if the function object gets added to the Set, than it means it has a unique reference in memory.
 *
 * This means that we are creating a new function at each re-render.
 *
 * If we need to avoid this, meaning we want to memoize (to cache) a function object, than `useCallback` is exactly what we need.
 *
 * Because the whole `App` function run every time state is set, as when increase buttons are clicked, the `functions.add(logName);` will be ran as well.  If this function object is different, in terms of reference in memory, a new instance of it will be added during every render, therefore increasing the contents of the `functions` Set.
 *
 * By commenting the line :
 *
  `const logName = () => console.log("boostup");`
 *
 * and uncommenting the line:
 *
  `const logName = useCallback(() => console.log("boostup"), []);`
 *
 * we can see that the `logName` function object is added only once to the Set.
 * 
 * Now, we should understand that both `incrementCount1` and `incrementCount2` functions are therefore re-created during every re-render.  
 * 
 * So, let's remedy this and let's turn these lines:
 * 
  const incrementCount1 = () => setCount1(count1 + 1);
  const incrementCount2 = () => setCount2(count2 + 1);
 * 
 * into :
 * 
  const incrementCount1 = useCallback(() => setCount1(count1 + 1), []);
  const incrementCount2 = useCallback(() => setCount2(count2 + 1), []);
 *
 * At this point, we notice that none of these functions get re-created since they are not added to the `functions` Set.  You know this because its length is not increasing.
 * 
 * So you might think that we're done achieving what we wanted, but in fact, 2 problems have arisen : 
 * 
 * 1) A new bug is introduced : when pressing the increase counter buttons, we noticed that their respective counter is incremented **only once**
 * 
 * 2) React has issued 2 warnings in the console of the browser, one for each `useCallback`, saying they have a missing dependency.  
 * 
 * This is because `count1` and `count2` are respectively used in the function body of the `incrementCount1` and `incrementCount2` functions, essentially making `count1` and `count2` dependencies of `incrementCount1` and `incrementCount2`, respectively.
 *
 * This is easily solved by following the suggestion found in the warnings, meaning by adding them to the respective array of dependency which `useCallback` takes as the second argument:
 * 
  const incrementCount1 = useCallback(() => setCount1(count1 + 1), [count1]);
  const incrementCount2 = useCallback(() => setCount2(count2 + 1), [count2]);
 *
 * Now, the counters are incremented every time a button is pressed, AND both warnings have dissapeard.
 * 
 * BUT : 
 * if you press the button to increase `counter1`, you notice that a new copy of `incrementCount1` IS STILL being added to the `functions` Set, and,
 * similarly, if you press the button to increase `counter2`, you notice that a new copy of `incrementCount2`  IS added to the `functions` Set !
 * 
 * So, why is that ? Isn't that what we're trying to solve here ?  
 * 
 * Yes, but because `count1` is increased every time the "Increase Count1" button is pressed, the memoize `incrementCount1` function IS different than the one found in the previous render.  And same thing happens with "Increase Count2" button.
 * 
 * But why ?  
 * 
 * Because `count1` and `count2` values change when their respective increment button is pressed.  Therefore, it is actually ok for its corresponding function to be re-created during the following re-render.
 * 
 * What we DO NOT want is for either of these functions to be re-created if their dependency DOES NOT change.
 * 
 * So : 
 * 
 * - when the "Increase Count1" button is clicked, the `incrementCount1` function is re-created during the next re-render, but the `incrementCount2` functions is NOT
 * - and vice-versa ; when the "Increase Count2" button is clicked, the `incrementCount2` function is re-created during the next re-render, but the `incrementCount1` functions is NOT.
 * 
 * So what is the benefit of using useCallback ?
 * 
 * Well, when we don't want the inline functions defined inside a functional (function-based) component to be instantiated (re-created) during every re-render subsequent to the intial render (the mounting) of that component.
 * 
 * So what is the difference between `useCallback` and `useMemo` ?  When do I use `useMemo` ?
 * 
 * Well, `useCallback` allows to avoid the re-instantiation of functions defined within a functional component.  Meaning that `useCallback` returns a cached version of the function itself, given the value of its dependencies have not changed.
 * 
 * Whereas `useMemo` allows to cache the **value** returned by a function that does something complex, meaning, time-consuming, or computationally expensive.  Caching its result will allow to gain the time it previously took to compute its return value, given the value of its dependencies have not changed.
 * 
 * CONCLUSION
 * 
 * So, `useCallback` and `useMemo` both allow to cache for reuse between re-renders.  While the first one caches the function itself (its reference in memory), the other one caches the return value of a function.
 * 
 */

// const functions = new Set();

const App = () => {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const incrementCount1 = () => setCount1(count1 + 1);
  const incrementCount2 = () => setCount2(count2 + 1);

  // const incrementCount1 = useCallback(() => setCount1(count1 + 1), []);
  // const incrementCount2 = useCallback(() => setCount2(count2 + 1), []);

  // const incrementCount1 = useCallback(() => setCount1(count1 + 1), [count1]);
  // const incrementCount2 = useCallback(() => setCount2(count2 + 1), [count2]);

  // functions.add(incrementCount1);
  // functions.add(incrementCount2);

  // const logName = () => console.log("boostup");
  // const logName = useCallback(() => console.log("boostup"), []);

  // functions.add(logName);

  // console.log(functions);

  const somethingThatTakesLong = useMemo(() => {
    console.log("somethingThatTakesLong");
    return count1 * 60 * 5;
  }, [count1]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        Count1: {count1}
        <button onClick={incrementCount1}>Increase Count1</button>
        Count2: {count2}
        <button onClick={incrementCount2}>Increase Count2</button>
        {/* <button onClick={logName}>Log Name</button> */}
        Do Something That Takes Long : {somethingThatTakesLong}
      </header>
    </div>
  );
};

export default App;
