import Ribhdux, { actionDispatcher, selector } from "../..";
import { inputSelector } from "../../decorators";

export interface ShopItem {
  name: string;
  value: number;
}

export type Items = ShopItem[];

export interface ShoppingCartState {
  taxPercent: number;
  items: Items;
}

class ShoppingCart extends Ribhdux<ShoppingCartState> {
  public taxPercent: number = 0;
  public items: Items = [];

  constructor(initialState: any) {
    super(initialState);
    super.createActionsFrom(this);
  }

  @actionDispatcher()
  addItem(name: string, value: number) {
    const item: ShopItem = { name, value };
    this.items.push(item);
  }

  @actionDispatcher()
  changeTax(percentage: number) {
    this.taxPercent = percentage;
  }

  @selector
  subTotal(items?): number {
    return items.reduce((acc, item) => acc + item.value, 0);
  }

  @selector
  tax(subTotal?, taxPercent?): number {
    return subTotal * (taxPercent / 100);
  }

  @selector
  total(subTotal?, tax?): any {
    return { total: subTotal + tax };
  }
}

export default ShoppingCart;
