import { Sandbox } from "@e2b/code-interpreter";
import dotenv from "dotenv";

dotenv.config();
export async function code_interpreter(code: any) {
  const sandbox = await Sandbox.create({
    apiKey: process.env.E2B_KEY,
  });
  const execution = await sandbox.runCode(code);
  console.log(execution.logs.stdout);
  if (!execution.logs.stderr) {
    return execution.logs.stdout;
  }
  return execution.logs.stderr;
}

code_interpreter('print("hello world")');
