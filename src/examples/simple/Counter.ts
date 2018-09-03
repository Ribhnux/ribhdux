// import * as React from "react";
import Ribhdux from "../..";
import { actionDispatcher } from "../../decorators";

export interface CounterState {
  amount: number;
  misc: string;
}

class Counter extends Ribhdux<CounterState> {
  public amount: number = 10;
  public misc: string = "misc data";

  constructor(initialState: any) {
    super(initialState);
    // super.use(logger);
    super.createActionsFrom(this);
  }

  @actionDispatcher()
  increment(amount: number) {
    this.amount = this.amount + amount;
    this.misc = "increment success";
  }

  @actionDispatcher()
  decrement(amount: number) {
    this.amount = this.amount - amount;
  }

  @actionDispatcher(true)
  async delayIncrement(amount: number) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.amount = this.amount + amount;
  }

  @actionDispatcher()
  squareOk() {
    this.amount = this.amount ** 2;
  }

  @actionDispatcher()
  multiplyThenAdd() {
    this.amount *= this.amount;
    this.amount += this.amount;
  }
}

export default Counter;
