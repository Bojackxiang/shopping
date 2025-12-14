export class CartError extends Error {
  public readonly code: string;

  constructor(message = "Cart Error") {
    super(message);
    this.name = "CartError";
    this.code = "CART_ERROR";

    // 修复 Error 子类在 TypeScript + Node 中的原型链
    Object.setPrototypeOf(this, CartError.prototype);
  }
}
