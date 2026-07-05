export type OperationLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface MathQuestion {
  question: string;
  answer: string;
  category: string;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathQuestion(level: OperationLevel, commutativity: boolean): MathQuestion {
  let num1 = 0;
  let num2 = 0;
  let question = "";
  let answer = "";
  let category = "";

  switch (level) {
    case 1: // Single-digit Addition (1+1 to 9+9)
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      if (!commutativity && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      question = `${num1} + ${num2}`;
      answer = (num1 + num2).toString();
      category = "addition";
      break;

    case 2: // Single-digit Subtraction (Inverse of L1)
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      question = `${num1 + num2} - ${num1}`;
      answer = num2.toString();
      category = "subtraction";
      break;

    case 3: // Single-digit Multiplication (1x1 to 9x9)
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      if (!commutativity && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      question = `${num1} × ${num2}`;
      answer = (num1 * num2).toString();
      category = "multiplication";
      break;

    case 4: // Single-digit Division (Inverse of L3)
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      question = `${num1 * num2} ÷ ${num1}`;
      answer = num2.toString();
      category = "division";
      break;

    case 5: // 2-Digit by 1-Digit Addition (10+1 to 99+9)
      num1 = getRandomInt(10, 99);
      num2 = getRandomInt(1, 9);
      if (commutativity && Math.random() > 0.5) {
        question = `${num2} + ${num1}`;
      } else {
        question = `${num1} + ${num2}`;
      }
      answer = (num1 + num2).toString();
      category = "addition";
      break;

    case 6: // 2-Digit by 1-Digit Subtraction (Inverse of L5)
      num1 = getRandomInt(10, 99);
      num2 = getRandomInt(1, 9);
      question = `${num1 + num2} - ${num2}`;
      answer = num1.toString();
      category = "subtraction";
      break;

    case 7: // 2-Digit by 1-Digit Multiplication (10x2 to 20x9)
      num1 = getRandomInt(10, 20);
      num2 = getRandomInt(2, 9);
      if (commutativity && Math.random() > 0.5) {
        question = `${num2} × ${num1}`;
      } else {
        question = `${num1} × ${num2}`;
      }
      answer = (num1 * num2).toString();
      category = "multiplication";
      break;

    case 8: // 2-Digit by 2-Digit Addition (10+10 to 99+99)
      num1 = getRandomInt(10, 99);
      num2 = getRandomInt(10, 99);
      if (!commutativity && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      question = `${num1} + ${num2}`;
      answer = (num1 + num2).toString();
      category = "addition";
      break;

    case 9: // 2-Digit by 2-Digit Subtraction (Inverse of L8)
      num1 = getRandomInt(10, 99);
      num2 = getRandomInt(10, 99);
      question = `${num1 + num2} - ${num2}`;
      answer = num1.toString();
      category = "subtraction";
      break;

    case 10: // 2-Digit by 2-Digit Multiplication (10x10 to 20x20)
      num1 = getRandomInt(10, 20);
      num2 = getRandomInt(10, 20);
      if (!commutativity && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      question = `${num1} × ${num2}`;
      answer = (num1 * num2).toString();
      category = "multiplication";
      break;
      
    default:
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      question = `${num1} + ${num2}`;
      answer = (num1 + num2).toString();
      category = "addition";
      break;
  }

  return { question, answer, category };
}
