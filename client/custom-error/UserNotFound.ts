export class UserNotFoundError extends Error {
  public readonly code: string;

  constructor(message = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
    this.code = "USER_NOT_FOUND";

    // 修复 Error 子类在 TypeScript + Node 中的原型链
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}
