export class OrderError extends Error {
  public readonly code: string;

  constructor(message = "Order Error") {
    super(message);
    this.name = "OrderError";
    this.code = "ORDER_ERROR";

    // 修复 Error 子类在 TypeScript + Node 中的原型链
    Object.setPrototypeOf(this, OrderError.prototype);
  }
}
