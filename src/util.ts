import sha from "sha.js";

export function getFunctionHash(fun: any): string {
  return sha("sha256")
    .update(fun.toString())
    .digest("hex");
}
