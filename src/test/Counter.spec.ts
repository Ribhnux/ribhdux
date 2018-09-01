// import * as Ribhdux from "../";
import Counter from "../examples/Simple/Counter";
import { expect } from "chai";
import "mocha";

describe("Counter", () => {
  it("should create ribhdux instance, do increment and decrement", async () => {
    const counterLogic: Counter = new Counter({
      amount: 0
    });

    expect(counterLogic.amount).to.be.eq(0);

    counterLogic.increment(2);
    expect(counterLogic.state.amount).to.be.eq(2);
    expect(counterLogic.state.misc).to.be.eq("increment success");

    counterLogic.increment(3);
    expect(counterLogic.state.amount).to.be.eq(5);

    counterLogic.decrement(4);
    expect(counterLogic.state.amount).to.be.eq(1);

    await counterLogic.delayIncrement(1);
    expect(counterLogic.state.amount).to.be.eq(2);

    counterLogic.squareOk();
    expect(counterLogic.state.amount).to.be.eq(4);

    counterLogic.multiplyThenAdd();
    expect(counterLogic.state.amount).to.be.eq(32);
  });
});
