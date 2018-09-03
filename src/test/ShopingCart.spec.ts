// import * as Ribhdux from "../";
import ShoppingCart from "../examples/simple/ShoppingCart";
import { expect } from "chai";
import "mocha";

describe("ShoppingCart", () => {
  const initialState = {
    taxPercent: 10,
    items: []
  };

  const cartFeature: ShoppingCart = new ShoppingCart(initialState);

  it("should add item", () => {
    cartFeature.addItem("apple", 1.2);
    cartFeature.addItem("orange", 0.95);

    expect(cartFeature.state.items.length).to.be.eq(2);
  });

  it("should change tax percent", () => {
    cartFeature.changeTax(10);

    expect(cartFeature.state.taxPercent).to.be.eq(10);
  });

  it("should get subtotal selector", () => {
    const subtotal = cartFeature.subTotal();
    expect(subtotal).to.be.eq(2.15);
  });

  it("should get tax selector", () => {
    cartFeature.changeTax(8);
    expect(cartFeature.state.taxPercent).to.be.eq(8);

    const tax = cartFeature.tax();
    expect(tax).to.be.eq(0.172);
  });

  it("should do total selector", () => {
    const total = cartFeature.total();

    expect(total.total).to.be.eq(2.322);
  });
});
