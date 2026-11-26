function myPromise() {
  return new Promise((resolve) => {
    resolve("Hello Students");
  });
}
myPromise().then((message) => {
  console.log(message);
});

let x = 10;
const checkValue = new Promise((resolve, reject) => {
  if (x === 10) {
    resolve("Success");
  } else {
    reject("Something went wrong");
  }
});
checkValue
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });

  
function checkAge(age) {
  return new Promise((resolve, reject) => {
    if (age >= 18) {
      resolve("You can vote");
    } else {
      reject("You cannot vote");
    }
  });
}
checkAge(20)
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.log(error);
  });

function addNumbers(a, b) {
  return new Promise((resolve) => {
    let sum = a + b;
    resolve(sum);
  });
}
addNumbers(5, 7).then((result) => {
  console.log("Sum:", result);
});

async function greet() {
  return "Hello, Welcome!";
}

greet().then((message) => {
  console.log(message);
});
function getData() {
  return new Promise((resolve) => {
    resolve("Data received successfully");
  });
}

async function displayData() {
  const result = await getData();
  console.log(result);
}
displayData();

function calculateSum(a, b) {
  return new Promise((resolve) => {
    resolve(a + b);
  });
}
async function showSum() {
  const sum = await calculateSum(15, 25);
  console.log("Sum:", sum);
}
showSum();

function checkResult(marks) {
  return new Promise((resolve, reject) => {
    if (marks >= 40) {
      resolve("Pass");
    } else {
      reject("Fail");
    }
  });
}

async function evaluateStudent() {
  try {
    const result = await checkResult(45); 
    console.log("Result:", result);
  } catch (error) {
    console.log("Result:", error);
  }
}
evaluateStudent();